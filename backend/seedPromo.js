const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const videoUrl = 'https://res.cloudinary.com/decscgrly/video/upload/v1775986094/hf_20260409_094622_41c4ed95-c7c2-49a8-933e-1cec2ea4e6d9_hfy5s1.mp4';

  // Upsert or create
  const promos = await prisma.promotion.findMany({ where: { placement: 'home' } });

  if (promos.length > 0) {
    await prisma.promotion.update({
      where: { id: promos[0].id },
      data: {
        title: 'Seedance 2.0 now available on Leelaah',
        description: 'Try the next generation of AI video generation models directly in the studio.',
        videoUrl: videoUrl,
        ctaText: 'Try it now',
        ctaLink: 'generation-modal', // This is what the frontend expects!
        tags: ['New Model', 'Text-to-Video'],
        isActive: true,
      }
    });
    console.log('Updated existing promotion.');
  } else {
    await prisma.promotion.create({
      data: {
        title: 'Seedance 2.0 now available on Leelaah',
        description: 'Try the next generation of AI video generation models directly in the studio.',
        videoUrl: videoUrl,
        ctaText: 'Try it now',
        ctaLink: 'generation-modal',
        tags: ['New Model', 'Text-to-Video'],
        placement: 'home',
        isActive: true,
        priority: 100
      }
    });
    console.log('Created new promotion.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
