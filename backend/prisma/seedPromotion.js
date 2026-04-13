const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🎬 Seeding Promotional Banner...');

    await prisma.promotion.upsert({
        where: { id: 'seedance-2-promo' },
        update: {
            title: 'Seedance 2.0 Now Available on Leelaah',
            subtitle: 'Image to Video',
            description: "ByteDance's most advanced video generation model. Cinematic output with native audio, real-world physics, and director-level camera control. Accepts text, image, audio, and video inputs.",
            tags: ['new', 'image-to-video', 'stylized', 'transform', 'lipsync'],
            videoUrl: 'https://res.cloudinary.com/decscgrly/video/upload/v1775986094/hf_20260409_094622_41c4ed95-c7c2-49a8-933e-1cec2ea4e6d9_hfy5s1.mp4',
            imageUrl: null,
            thumbnailUrl: null,
            ctaText: 'Try it now!',
            ctaLink: 'ai-studio',
            ctaSecondary: 'See docs',
            ctaSecondaryLink: 'https://docs.leelaah.com',
            isActive: true,
            priority: 10,
            startsAt: null,
            endsAt: null,
            placement: 'home',
        },
        create: {
            id: 'seedance-2-promo',
            title: 'Seedance 2.0 Now Available on Leelaah',
            subtitle: 'Image to Video',
            description: "ByteDance's most advanced video generation model. Cinematic output with native audio, real-world physics, and director-level camera control. Accepts text, image, audio, and video inputs.",
            tags: ['new', 'image-to-video', 'stylized', 'transform', 'lipsync'],
            videoUrl: 'https://res.cloudinary.com/decscgrly/video/upload/v1775986094/hf_20260409_094622_41c4ed95-c7c2-49a8-933e-1cec2ea4e6d9_hfy5s1.mp4',
            imageUrl: null,
            thumbnailUrl: null,
            ctaText: 'Try it now!',
            ctaLink: 'ai-studio',
            ctaSecondary: 'See docs',
            ctaSecondaryLink: 'https://docs.leelaah.com',
            isActive: true,
            priority: 10,
            startsAt: null,
            endsAt: null,
            placement: 'home',
        },
    });

    console.log('✅ Promotional banner seeded successfully!');
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
