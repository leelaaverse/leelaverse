const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
	fileFilter: (req, file, cb) => {
		// Accept any file with an image mimetype
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			console.log('Rejected file:', file.mimetype, file.originalname);
			cb(new Error('Only image files are allowed'));
		}
	}
});

/**
 * Upload media (image) for chat messages
 */
const uploadChatMedia = [
	upload.single('media'),
	async (req, res) => {
		try {
			if (!req.file) {
				return res.status(400).json({
					success: false,
					message: 'No media file provided'
				});
			}

			// Upload buffer to Cloudinary using stream
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: 'chat_media',
					resource_type: 'auto',
					transformation: [
						{ quality: 'auto:good' },
						{ fetch_format: 'auto' }
					]
				},
				(error, result) => {
					if (error) {
						console.error('Cloudinary upload error:', error);
						return res.status(500).json({
							success: false,
							message: 'Failed to upload to Cloudinary',
							error: error.message
						});
					}

					res.json({
						success: true,
						url: result.secure_url,
						publicId: result.public_id
					});
				}
			);

			// Pipe the file buffer to Cloudinary
			const streamifier = require('streamifier');
			streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

		} catch (error) {
			console.error('Chat media upload error:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to upload media',
				error: error.message
			});
		}
	}
];

module.exports = { uploadChatMedia };
