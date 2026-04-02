const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Community Data...');

    // 1. Reward Configs
    const rewardConfigs = [
        { key: 'post_created', coinReward: 5, xpReward: 10, description: 'Created a new post' },
        { key: 'like_received', coinReward: 1, xpReward: 2, description: 'Received a like on a post' },
        { key: 'comment_received', coinReward: 2, xpReward: 5, description: 'Received a comment on a post' },
        { key: 'share_received', coinReward: 3, xpReward: 8, description: 'Post was shared' },
        { key: 'daily_login', coinReward: 3, xpReward: 5, description: 'Daily login bonus' },
        { key: 'streak_bonus', coinReward: 1, xpReward: 2, description: 'Multiplier for consecutive days posting' },
        { key: 'viral_post', coinReward: 25, xpReward: 50, description: 'Post reached 100 likes' },
        { key: 'competition_participation', coinReward: 0, xpReward: 5, description: 'Joined a competition' }
    ];

    for (const config of rewardConfigs) {
        await prisma.rewardConfig.upsert({
            where: { key: config.key },
            update: config,
            create: config,
        });
    }
    console.log('✅ Reward Configs seeded');

    // 2. Badges
    const badges = [
        {
            name: 'first_post',
            displayName: 'First Step',
            description: 'Create your very first AI masterpiece.',
            category: 'posting',
            requirement: { type: 'post_count', value: 1 },
            coinReward: 50,
            xpReward: 100,
            rarity: 'common',
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/2069/2069811.png'
        },
        {
            name: 'post_10',
            displayName: 'Rising Star',
            description: 'Create 10 posts.',
            category: 'posting',
            requirement: { type: 'post_count', value: 10 },
            coinReward: 100,
            xpReward: 250,
            rarity: 'uncommon',
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135805.png'
        },
        {
            name: 'streak_7',
            displayName: 'Weekly Warrior',
            description: 'Maintain a 7-day posting streak.',
            category: 'engagement',
            requirement: { type: 'streak', value: 7 },
            coinReward: 250,
            xpReward: 500,
            rarity: 'rare',
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/5768/5768134.png'
        },
        {
            name: 'comp_winner',
            displayName: 'Champion',
            description: 'Win 1st place in any competition.',
            category: 'competition',
            requirement: { type: 'competitions_won', value: 1 },
            coinReward: 500,
            xpReward: 1000,
            rarity: 'epic',
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png'
        },
        {
            name: 'platinum_tier',
            displayName: 'Platinum Creator',
            description: 'Reach the Platinum creator tier.',
            category: 'milestone',
            requirement: { type: 'xp', value: 15000 },
            tier: 'platinum',
            coinReward: 1000,
            xpReward: 0,
            rarity: 'legendary',
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/1792/1792822.png'
        }
    ];

    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { name: badge.name },
            update: badge,
            create: badge,
        });
    }
    console.log('✅ Badges seeded');

    // 3. Demo Competition
    // Assign to first admin user if exists, or just get any user
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } }) || await prisma.user.findFirst();

    if (admin) {
        const now = new Date();
        const endsAt = new Date();
        endsAt.setDate(now.getDate() + 7);

        await prisma.competition.create({
            data: {
                creatorId: admin.id,
                title: 'Cyberpunk Extravaganza',
                description: 'Show us your best Cyberpunk-themed AI art! Let the neon flow. Top 3 win huge coin prizes and a special badge.',
                rules: 'Must be generated using Leelaverse AI Studio. No external edits. Minimum 16:9 aspect ratio.',
                category: 'ai-art',
                submissionType: 'image',
                maxSubmissions: 3,
                startsAt: now,
                endsAt: endsAt,
                status: 'live',
                prizePool: 2000,
                prizeBreakdown: { '1st': 1000, '2nd': 600, '3rd': 400 },
                tags: ['cyberpunk', 'neon', 'futuristic'],
                isFeatured: true,
                isApproved: true,
                createdByRole: 'admin',
                coverImage: 'https://files.catbox.moe/r4c3ok.webp'
            }
        });
        console.log('✅ Demo Competition seeded');
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
