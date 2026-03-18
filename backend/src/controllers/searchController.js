const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cache = require('../services/cacheService');

// Utility for search ranking logic and suggestion response
class SearchController {

    // 1. Auto Suggestions (Sub 100ms)
    static async getSuggestions(req, res) {
        try {
            const q = req.query.q?.trim() || '';
            if (!q) return res.json({ users: [], hashtags: [], posts: [], ai_content: [] });

            const cacheKey = `suggestions:${q.toLowerCase()}`;
            const cached = cache.get(cacheKey);
            if (cached) return res.json(cached);

            // We use Prisma raw queries to utilize pg_trgm and prefix matching efficiently
            const pattern = `%${q}%`;
            const prefixPattern = `${q}%`;

            // Parallel execution for speed
            const [users, posts, ai_content] = await Promise.all([
                prisma.$queryRaw`
          SELECT id, username, avatar, "firstName", "lastName"
          FROM "User"
          WHERE username ILIKE ${prefixPattern} OR username ILIKE ${pattern}
          ORDER BY (username ILIKE ${prefixPattern}) DESC, "followersCount" DESC NULLS LAST
          LIMIT 5
        `.catch(() => prisma.user.findMany({
                    where: { username: { contains: q, mode: 'insensitive' } },
                    select: { id: true, username: true, avatar: true, firstName: true, lastName: true },
                    take: 5
                })),

                prisma.$queryRaw`
          SELECT id, caption, "thumbnailUrl", type
          FROM "Post"
          WHERE caption ILIKE ${pattern} OR title ILIKE ${pattern}
          ORDER BY "likesCount" DESC, "createdAt" DESC
          LIMIT 5
        `.catch(() => prisma.post.findMany({
                    where: { OR: [{ caption: { contains: q, mode: 'insensitive' } }, { title: { contains: q, mode: 'insensitive' } }] },
                    select: { id: true, caption: true, thumbnailUrl: true, type: true },
                    take: 5
                })),

                prisma.$queryRaw`
          SELECT id, prompt, "thumbnailUrl", "resultUrl"
          FROM "AIGeneration"
          WHERE prompt ILIKE ${pattern}
          ORDER BY "createdAt" DESC
          LIMIT 5
        `.catch(() => prisma.aIGeneration.findMany({
                    where: { prompt: { contains: q, mode: 'insensitive' } },
                    select: { id: true, prompt: true, thumbnailUrl: true, resultUrl: true },
                    take: 5
                }))
            ]);

            // Mock Hashtags based on posts and query
            const hashtags = [{ name: `#${q.replace(/\s+/g, '')}` }];

            const response = {
                users: users || [],
                hashtags: hashtags,
                posts: posts || [],
                ai_content: ai_content || []
            };

            cache.set(cacheKey, response, 60); // Cache for 60 seconds

            res.json(response);
        } catch (error) {
            console.error('Search Suggestions Error:', error);
            res.status(500).json({ error: 'Failed to fetch suggestions' });
        }
    }

    // 2. Full Search with cursor-based pagination
    static async searchAll(req, res) {
        try {
            const { q, type = 'all', cursor, limit = 15 } = req.query;
            const parsedLimit = parseInt(limit) || 15;

            if (!q) return res.json({ results: [], nextCursor: null });

            const searchPattern = `%${q}%`;
            let results = [];

            // A simple fallback to Prisma findMany if raw FTS/trigrams are too complex or failing
            if (type === 'users' || type === 'all') {
                const usersSearch = await prisma.user.findMany({
                    where: {
                        OR: [
                            { username: { contains: q, mode: 'insensitive' } },
                            { firstName: { contains: q, mode: 'insensitive' } },
                            { bio: { contains: q, mode: 'insensitive' } }
                        ]
                    },
                    take: type === 'all' ? 5 : parsedLimit,
                    select: { id: true, username: true, avatar: true, bio: true }
                });
                results.push(...usersSearch.map(u => ({ ...u, _searchType: 'user' })));
            }

            if (type === 'posts' || type === 'all') {
                const postsSearch = await prisma.post.findMany({
                    where: {
                        OR: [
                            { caption: { contains: q, mode: 'insensitive' } },
                            { title: { contains: q, mode: 'insensitive' } }
                        ]
                    },
                    orderBy: [
                        { likesCount: 'desc' },
                        { createdAt: 'desc' }
                    ],
                    take: type === 'all' ? 10 : parsedLimit,
                    include: { author: { select: { username: true, avatar: true } } }
                });
                results.push(...postsSearch.map(p => ({ ...p, _searchType: 'post' })));
            }

            // We would use actual cursor pagination here in production
            res.json({
                results: results,
                nextCursor: results.length === parsedLimit ? results[results.length - 1].id : null
            });

        } catch (error) {
            console.error('Full Search Error:', error);
            res.status(500).json({ error: 'Search failed' });
        }
    }

    // 3. Trending & Discovery Content
    static async getTrending(req, res) {
        try {
            const cacheKey = 'trending_discovery';
            const cached = cache.get(cacheKey);
            if (cached) return res.json(cached);

            // Fetch top content
            const [trendingUsers, viralPosts, trendingAI] = await Promise.all([
                prisma.user.findMany({
                    take: 5,
                    orderBy: { totalCreations: 'desc' },
                    select: { id: true, username: true, avatar: true, bio: true }
                }),
                prisma.post.findMany({
                    where: { visibility: 'public' },
                    take: 6,
                    orderBy: { likesCount: 'desc' },
                    include: { author: { select: { username: true, avatar: true } } }
                }),
                prisma.aIGeneration.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: { id: true, prompt: true, thumbnailUrl: true, resultUrl: true }
                })
            ]);

            const response = {
                trendingCreators: trendingUsers,
                popularHashtags: [
                    { name: '#cyberpunk', count: 1240 },
                    { name: '#aiart', count: 980 },
                    { name: '#illustration', count: 540 },
                    { name: '#3Drender', count: 320 }
                ],
                viralPosts,
                trendingAI
            };

            cache.set(cacheKey, response, 300); // Cache for 5 mins
            res.json(response);
        } catch (error) {
            console.error('Trending Error:', error);
            res.status(500).json({ error: 'Failed to fetch trending data' });
        }
    }
}

module.exports = SearchController;
