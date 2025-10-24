// Mock data for LeelaVerse AI Social Platform
export const mockPosts = [
    {
        id: 1,
        user: {
            username: 'aria_creator',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop',
        caption: 'Just created this amazing AI artwork using Leelaverse! The future of creativity is here 🚀',
        likes: 1247,
        comments: 23,
        location: 'Digital Canvas',
        timeAgo: '2 HOURS AGO',
        aiModel: 'DALL-E 3',
        prompt: 'Futuristic cityscape with neon lights and flying cars at sunset',
        neuralScore: 9.8,
        generationTime: '3.2s',
        steps: 50,
        views: '2.1k',
        tags: ['AIart', 'Leelaverse', 'creativity', 'futuristic']
    },
    {
        id: 2,
        user: {
            username: 'digital_dreams',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=600&fit=crop',
        caption: 'Exploring the boundaries between reality and imagination ✨ What do you think of this cyberpunk aesthetic?',
        likes: 892,
        comments: 45,
        location: 'Neo Tokyo',
        timeAgo: '4 HOURS AGO',
        aiModel: 'Midjourney V6',
        prompt: 'Cyberpunk aesthetic with neon reflections and rain-soaked streets',
        neuralScore: 9.3,
        generationTime: '4.8s',
        steps: 75,
        views: '1.8k',
        tags: ['cyberpunk', 'neon', 'aesthetic', 'digital']
    },
    {
        id: 3,
        user: {
            username: 'neon_artist',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop',
        caption: 'When AI meets human creativity, magic happens! 🎨 This piece took 3 iterations to perfect.',
        likes: 2156,
        comments: 67,
        location: 'Art Studio',
        timeAgo: '6 HOURS AGO',
        aiModel: 'Stable Diffusion XL',
        prompt: 'Abstract art with flowing colors and dynamic energy',
        neuralScore: 9.9,
        generationTime: '2.1s',
        steps: 30,
        views: '4.2k',
        tags: ['abstract', 'flowing', 'colors', 'energy']
    },
    {
        id: 4,
        user: {
            username: 'future_vision',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=600&fit=crop',
        caption: 'Sunset over the digital horizon. Sometimes the most beautiful art comes from the simplest prompts 🌅',
        likes: 743,
        comments: 28,
        location: 'Virtual Landscape',
        timeAgo: '8 HOURS AGO',
        aiModel: 'Leonardo AI',
        prompt: 'Beautiful sunset over mountain landscape with warm colors',
        neuralScore: 8.7,
        generationTime: '5.3s',
        steps: 40,
        views: '1.2k',
        tags: ['sunset', 'landscape', 'nature', 'warm']
    },
    {
        id: 5,
        user: {
            username: 'cosmic_creator',
            avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=600&fit=crop',
        caption: 'Exploring the cosmos through AI-generated art. Each star tells a story 🌌',
        likes: 1534,
        comments: 89,
        location: 'Deep Space',
        timeAgo: '12 HOURS AGO',
        aiModel: 'Firefly',
        prompt: 'Deep space nebula with bright stars and cosmic dust clouds',
        neuralScore: 9.5,
        generationTime: '6.7s',
        steps: 60,
        views: '3.1k',
        tags: ['SpaceArt', 'AI', 'Cosmos', 'nebula']
    },
    {
        id: 6,
        user: {
            username: 'synth_wave',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1614850523296-d0775cc2e4ad?w=600&h=600&fit=crop',
        caption: 'Retro-futuristic vibes with AI precision! 🌈 Love how neural networks can capture that 80s aesthetic',
        likes: 1876,
        comments: 92,
        location: 'Synthwave City',
        timeAgo: '1 DAY AGO',
        aiModel: 'RunwayML',
        prompt: 'Retro synthwave aesthetic with neon grids and mountain silhouettes',
        neuralScore: 9.2,
        generationTime: '4.1s',
        steps: 45,
        views: '2.8k',
        tags: ['synthwave', 'retro', 'neon', '80s']
    }
];

export const mockStories = [
    {
        id: 1,
        username: 'aria_creator',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        viewed: false,
        aiActivity: 'Training Model'
    },
    {
        id: 2,
        username: 'digital_dreams',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        viewed: true,
        aiActivity: 'Live Streaming'
    },
    {
        id: 3,
        username: 'neon_artist',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        viewed: false,
        aiActivity: 'Generating Art'
    },
    {
        id: 4,
        username: 'future_vision',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        viewed: false,
        aiActivity: 'Experimenting'
    },
    {
        id: 5,
        username: 'cosmic_creator',
        avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face',
        viewed: true
    },
    {
        id: 6,
        username: 'pixel_master',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        viewed: false
    }
];

export const mockSuggestedUsers = [
    {
        id: 1,
        username: 'ai_enthusiast',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
        mutualFollowers: '12 mutual'
    },
    {
        id: 2,
        username: 'creative_minds',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
        mutualFollowers: '8 mutual'
    },
    {
        id: 3,
        username: 'tech_artist',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop&crop=face',
        mutualFollowers: '5 mutual'
    },
    {
        id: 4,
        username: 'visual_poet',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
        mutualFollowers: '15 mutual'
    },
    {
        id: 5,
        username: 'code_painter',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face',
        mutualFollowers: '3 mutual'
    }
];

export const mockCurrentUser = {
    id: 'current',
    username: 'leelaverse_user',
    name: 'Creative Explorer',
    firstName: 'Creative Explorer',
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop&crop=face',
    profileWallTheme: 'gradient-purple',
    bio: 'AI artist and creative enthusiast exploring the boundaries of digital art 🎨✨',
    location: 'San Francisco, CA',
    website: 'https://myportfolio.com',
    followers: '1.2K',
    following: 892,
    posts: 156,
    verificationStatus: 'verified'
};