require('dotenv').config();
const { fal } = require("@fal-ai/client");
const mongoose = require('mongoose');

// Configure FAL AI
fal.config({
    credentials: process.env.FAL_KEY
});

async function testFluxSchnell() {
    try {
        console.log('🚀 Testing FLUX Schnell Image Generation...\n');

        // Step 1: Submit request
        console.log('📝 Step 1: Submitting request to FAL AI...');
        const { request_id } = await fal.queue.submit("fal-ai/flux/schnell", {
            input: {
                prompt: "A beautiful sunset over mountains",
                image_size: "landscape_16_9",
                num_inference_steps: 4,
                guidance_scale: 3.5,
                num_images: 1,
                enable_safety_checker: true,
                output_format: "jpeg"
            }
        });

        console.log('✅ Request submitted successfully!');
        console.log('Request ID:', request_id);
        console.log('');

        // Step 2: Poll for status
        console.log('📊 Step 2: Checking status...');
        let attempts = 0;
        let maxAttempts = 30;
        let completed = false;

        while (attempts < maxAttempts && !completed) {
            try {
                const status = await fal.queue.status("fal-ai/flux/schnell", {
                    requestId: request_id,
                    logs: true
                });

                console.log(`Status check ${attempts + 1}:`, status.status);

                if (status.queue_position) {
                    console.log('Queue position:', status.queue_position);
                }

                if (status.logs && status.logs.length > 0) {
                    console.log('Logs:', status.logs.map(log => log.message).join(', '));
                }

                if (status.status === "COMPLETED") {
                    console.log('✅ Generation completed!\n');
                    completed = true;
                    break;
                } else if (status.status === "FAILED") {
                    console.error('❌ Generation failed!');
                    return;
                }

                // Wait 2 seconds before next check
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;

            } catch (error) {
                console.error('❌ Error checking status:', error.message);
                if (error.body) {
                    console.error('Error details:', JSON.stringify(error.body, null, 2));
                }
                return;
            }
        }

        if (!completed) {
            console.log('⏱️  Timeout waiting for completion');
            return;
        }

        // Step 3: Get result
        console.log('🎨 Step 3: Getting result...');
        const result = await fal.queue.result("fal-ai/flux/schnell", {
            requestId: request_id
        });

        console.log('✅ Result retrieved successfully!\n');
        console.log('Image URL:', result.data.images[0]?.url);
        console.log('Seed:', result.data.seed);
        console.log('Prompt:', result.data.prompt);
        console.log('\n✨ Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.body) {
            console.error('Error details:', JSON.stringify(error.body, null, 2));
        }
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    }
}

// Run test
testFluxSchnell();
