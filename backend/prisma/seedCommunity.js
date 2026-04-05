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

    // 2. Badges — full badge table
    // Earning types: post_count | streak | xp | competitions_entered | competitions_won | followers | templates_created
    const badges = [

        // ── POSTING ──────────────────────────────────────────────────────────
        {
            name: 'first_post',
            displayName: 'First Step',
            description: 'Publish your very first AI creation.',
            category: 'posting',
            requirement: { type: 'post_count', value: 1 },
            coinReward: 50,
            xpReward: 100,
            rarity: 'common',
            sortOrder: 10,
            iconUrl: null,
        },
        {
            name: 'post_10',
            displayName: 'Rising Creator',
            description: 'Publish 10 AI creations.',
            category: 'posting',
            requirement: { type: 'post_count', value: 10 },
            coinReward: 100,
            xpReward: 250,
            rarity: 'common',
            sortOrder: 11,
            iconUrl: null,
        },
        {
            name: 'post_50',
            displayName: 'Prolific Artist',
            description: 'Publish 50 AI creations.',
            category: 'posting',
            requirement: { type: 'post_count', value: 50 },
            coinReward: 300,
            xpReward: 750,
            rarity: 'uncommon',
            sortOrder: 12,
            iconUrl: null,
        },
        {
            name: 'post_100',
            displayName: 'Content Machine',
            description: 'Publish 100 AI creations.',
            category: 'posting',
            requirement: { type: 'post_count', value: 100 },
            coinReward: 750,
            xpReward: 2000,
            rarity: 'rare',
            sortOrder: 13,
            iconUrl: null,
        },
        {
            name: 'post_500',
            displayName: 'Legend of Leela',
            description: 'Publish 500 AI creations.',
            category: 'posting',
            requirement: { type: 'post_count', value: 500 },
            coinReward: 5000,
            xpReward: 10000,
            rarity: 'legendary',
            sortOrder: 14,
            iconUrl: null,
        },

        // ── STREAK / ENGAGEMENT ───────────────────────────────────────────────
        {
            name: 'streak_3',
            displayName: 'Spark',
            description: 'Post for 3 days in a row.',
            category: 'engagement',
            requirement: { type: 'streak', value: 3 },
            coinReward: 75,
            xpReward: 150,
            rarity: 'common',
            sortOrder: 20,
            iconUrl: null,
        },
        {
            name: 'streak_7',
            displayName: 'Weekly Warrior',
            description: 'Post for 7 days in a row.',
            category: 'engagement',
            requirement: { type: 'streak', value: 7 },
            coinReward: 200,
            xpReward: 500,
            rarity: 'uncommon',
            sortOrder: 21,
            iconUrl: null,
        },
        {
            name: 'streak_14',
            displayName: 'Fortnight Fire',
            description: 'Post for 14 days straight.',
            category: 'engagement',
            requirement: { type: 'streak', value: 14 },
            coinReward: 500,
            xpReward: 1200,
            rarity: 'rare',
            sortOrder: 22,
            iconUrl: null,
        },
        {
            name: 'streak_30',
            displayName: 'Month of Mastery',
            description: 'Post every day for a full month.',
            category: 'engagement',
            requirement: { type: 'streak', value: 30 },
            coinReward: 1500,
            xpReward: 4000,
            rarity: 'epic',
            sortOrder: 23,
            iconUrl: null,
        },
        {
            name: 'streak_100',
            displayName: 'Centurion',
            description: '100-day posting streak — truly relentless.',
            category: 'engagement',
            requirement: { type: 'streak', value: 100 },
            coinReward: 8000,
            xpReward: 20000,
            rarity: 'legendary',
            sortOrder: 24,
            iconUrl: null,
        },

        // ── FOLLOWERS ─────────────────────────────────────────────────────────
        {
            name: 'followers_10',
            displayName: 'First Fans',
            description: 'Gain your first 10 followers.',
            category: 'engagement',
            requirement: { type: 'followers', value: 10 },
            coinReward: 50,
            xpReward: 100,
            rarity: 'common',
            sortOrder: 30,
            iconUrl: null,
        },
        {
            name: 'followers_100',
            displayName: 'Rising Influence',
            description: 'Reach 100 followers.',
            category: 'engagement',
            requirement: { type: 'followers', value: 100 },
            coinReward: 300,
            xpReward: 750,
            rarity: 'uncommon',
            sortOrder: 31,
            iconUrl: null,
        },
        {
            name: 'followers_1000',
            displayName: 'Community Star',
            description: 'Reach 1,000 followers.',
            category: 'milestone',
            requirement: { type: 'followers', value: 1000 },
            coinReward: 1000,
            xpReward: 3000,
            rarity: 'rare',
            sortOrder: 32,
            iconUrl: null,
        },
        {
            name: 'followers_10000',
            displayName: 'Viral Creator',
            description: 'Reach 10,000 followers.',
            category: 'milestone',
            requirement: { type: 'followers', value: 10000 },
            coinReward: 5000,
            xpReward: 15000,
            rarity: 'epic',
            sortOrder: 33,
            iconUrl: null,
        },

        // ── COMPETITION ───────────────────────────────────────────────────────
        {
            name: 'comp_enter_1',
            displayName: 'First Arena',
            description: 'Enter your first competition.',
            category: 'competition',
            requirement: { type: 'competitions_entered', value: 1 },
            coinReward: 75,
            xpReward: 150,
            rarity: 'common',
            sortOrder: 40,
            iconUrl: null,
        },
        {
            name: 'comp_enter_5',
            displayName: 'Arena Regular',
            description: 'Enter 5 competitions.',
            category: 'competition',
            requirement: { type: 'competitions_entered', value: 5 },
            coinReward: 250,
            xpReward: 600,
            rarity: 'uncommon',
            sortOrder: 41,
            iconUrl: null,
        },
        {
            name: 'comp_winner',
            displayName: 'Champion',
            description: 'Win 1st place in any competition.',
            category: 'competition',
            requirement: { type: 'competitions_won', value: 1 },
            coinReward: 1000,
            xpReward: 2500,
            rarity: 'epic',
            sortOrder: 42,
            iconUrl: null,
        },
        {
            name: 'comp_winner_3',
            displayName: 'Hat-Trick Hero',
            description: 'Win 3 competitions.',
            category: 'competition',
            requirement: { type: 'competitions_won', value: 3 },
            coinReward: 3000,
            xpReward: 8000,
            rarity: 'legendary',
            sortOrder: 43,
            iconUrl: null,
        },

        // ── TEMPLATES ─────────────────────────────────────────────────────────
        {
            name: 'template_creator_1',
            displayName: 'Template Maker',
            description: 'Publish your first prompt template.',
            category: 'special',
            requirement: { type: 'templates_created', value: 1 },
            coinReward: 100,
            xpReward: 200,
            rarity: 'common',
            sortOrder: 50,
            iconUrl: null,
        },
        {
            name: 'template_creator_10',
            displayName: 'Prompt Architect',
            description: 'Publish 10 prompt templates.',
            category: 'special',
            requirement: { type: 'templates_created', value: 10 },
            coinReward: 500,
            xpReward: 1500,
            rarity: 'rare',
            sortOrder: 51,
            iconUrl: null,
        },

        // ── XP / TIER MILESTONES ──────────────────────────────────────────────
        {
            name: 'xp_silver',
            displayName: 'Silver Creator',
            description: 'Reach Silver tier (1,000 XP).',
            category: 'milestone',
            requirement: { type: 'xp', value: 1000 },
            tier: 'silver',
            coinReward: 200,
            xpReward: 0,
            rarity: 'common',
            sortOrder: 60,
            iconUrl: null,
        },
        {
            name: 'xp_gold',
            displayName: 'Gold Creator',
            description: 'Reach Gold tier (5,000 XP).',
            category: 'milestone',
            requirement: { type: 'xp', value: 5000 },
            tier: 'gold',
            coinReward: 600,
            xpReward: 0,
            rarity: 'uncommon',
            sortOrder: 61,
            iconUrl: null,
        },
        {
            name: 'xp_platinum',
            displayName: 'Platinum Creator',
            description: 'Reach Platinum tier (15,000 XP).',
            category: 'milestone',
            requirement: { type: 'xp', value: 15000 },
            tier: 'platinum',
            coinReward: 1500,
            xpReward: 0,
            rarity: 'rare',
            sortOrder: 62,
            iconUrl: null,
        },
        {
            name: 'xp_diamond',
            displayName: 'Diamond Creator',
            description: 'Reach Diamond tier (50,000 XP).',
            category: 'milestone',
            requirement: { type: 'xp', value: 50000 },
            tier: 'diamond',
            coinReward: 5000,
            xpReward: 0,
            rarity: 'legendary',
            sortOrder: 63,
            iconUrl: null,
        },
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
