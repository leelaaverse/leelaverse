require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary Configuration...\n');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NOT SET');
console.log('\nAttempting to verify credentials...\n');

// Test with a simple API call
cloudinary.api.ping()
	.then(result => {
		console.log('✅ Cloudinary connection successful!');
		console.log('Result:', result);
	})
	.catch(error => {
		console.error('❌ Cloudinary connection failed!');
		console.error('Error:', error);
		
		if (error.http_code === 401) {
			console.error('\n⚠️  Authentication Error: Your API credentials are invalid.');
			console.error('Please check:');
			console.error('1. CLOUDINARY_CLOUD_NAME is correct');
			console.error('2. CLOUDINARY_API_KEY is correct');
			console.error('3. CLOUDINARY_API_SECRET is correct (no extra spaces/quotes)');
		}
	});
