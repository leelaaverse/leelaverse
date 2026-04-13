/**
 * Seed Script — Insert all AI Models into the AIModel table
 * Run: node src/ai-generation/seedModels.js
 */

require('dotenv').config();
const prisma = require('../config/prisma');
const { getAllModels, MODEL_CATEGORIES } = require('./config/modelRegistry');

// Map registry categories to DB categories
const categoryMap = {
    [MODEL_CATEGORIES.TEXT_TO_IMAGE]: 'image_generation',
    [MODEL_CATEGORIES.IMAGE_TO_IMAGE]: 'image_editing',
    [MODEL_CATEGORIES.BACKGROUND_REMOVAL]: 'image_utility',
    [MODEL_CATEGORIES.IMAGE_UPSCALE]: 'image_utility',
    [MODEL_CATEGORIES.VIDEO_UPSCALE]: 'video_utility',
    [MODEL_CATEGORIES.TEXT_TO_VIDEO]: 'video_generation',
    [MODEL_CATEGORIES.IMAGE_TO_VIDEO]: 'video_generation'
};

async function seedModels() {
    console.log('🌱 Starting AI Model seeding...\n');

    const models = getAllModels();
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const model of models) {
        const dbCategory = categoryMap[model.category] || model.category;

        try {
            // Check if model already exists by modelId (falEndpoint)
            const existing = await prisma.aIModel.findUnique({
                where: { modelId: model.falEndpoint }
            });

            if (existing) {
                // Update existing model
                await prisma.aIModel.update({
                    where: { modelId: model.falEndpoint },
                    data: {
                        name: model.name,
                        provider: model.provider,
                        category: dbCategory,
                        description: model.description,
                        coinCost: model.creditCost,
                        isActive: true
                    }
                });
                console.log(`  ♻️  Updated: ${model.name} (${model.falEndpoint})`);
                updated++;
            } else {
                // Create new model
                await prisma.aIModel.create({
                    data: {
                        name: model.name,
                        provider: model.provider,
                        category: dbCategory,
                        modelId: model.falEndpoint,
                        description: model.description,
                        coinCost: model.creditCost,
                        isActive: true
                    }
                });
                console.log(`  ✅ Created: ${model.name} (${model.falEndpoint})`);
                created++;
            }
        } catch (error) {
            // Handle unique constraint on name — append category to make unique
            if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
                try {
                    const uniqueName = `${model.name} (${model.category})`;
                    const existingByEndpoint = await prisma.aIModel.findUnique({
                        where: { modelId: model.falEndpoint }
                    });

                    if (existingByEndpoint) {
                        await prisma.aIModel.update({
                            where: { modelId: model.falEndpoint },
                            data: {
                                name: uniqueName,
                                provider: model.provider,
                                category: dbCategory,
                                description: model.description,
                                coinCost: model.creditCost,
                                isActive: true
                            }
                        });
                        console.log(`  ♻️  Updated (renamed): ${uniqueName}`);
                        updated++;
                    } else {
                        await prisma.aIModel.create({
                            data: {
                                name: uniqueName,
                                provider: model.provider,
                                category: dbCategory,
                                modelId: model.falEndpoint,
                                description: model.description,
                                coinCost: model.creditCost,
                                isActive: true
                            }
                        });
                        console.log(`  ✅ Created (renamed): ${uniqueName}`);
                        created++;
                    }
                } catch (innerError) {
                    console.error(`  ❌ Failed: ${model.name} — ${innerError.message}`);
                    skipped++;
                }
            } else {
                console.error(`  ❌ Failed: ${model.name} — ${error.message}`);
                skipped++;
            }
        }
    }

    console.log('\n========================================');
    console.log(`🌱 Seeding complete!`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ♻️  Updated: ${updated}`);
    console.log(`   ❌ Skipped: ${skipped}`);
    console.log(`   📊 Total models in registry: ${models.length}`);
    console.log('========================================\n');

    // Print final state
    const allDbModels = await prisma.aIModel.findMany({
        orderBy: { category: 'asc' }
    });
    console.log(`📋 Models in database: ${allDbModels.length}\n`);
    
    const grouped = {};
    for (const m of allDbModels) {
        if (!grouped[m.category]) grouped[m.category] = [];
        grouped[m.category].push(m);
    }

    for (const [cat, models] of Object.entries(grouped)) {
        console.log(`\n  📂 ${cat} (${models.length}):`);
        for (const m of models) {
            console.log(`     ${m.isActive ? '🟢' : '🔴'} ${m.name} — ${m.coinCost} coins — ${m.modelId}`);
        }
    }

    await prisma.$disconnect();
}

seedModels().catch((error) => {
    console.error('Seed failed:', error);
    prisma.$disconnect();
    process.exit(1);
});
