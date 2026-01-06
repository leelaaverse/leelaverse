import imageCompression from 'browser-image-compression';

/**
 * Compress image with quality preserved
 * @param {File} imageFile - The image file to compress
 * @returns {Promise<File>} - Compressed image file
 */
export async function compressImage(imageFile) {
	const options = {
		maxSizeMB: 1, // Max file size 1MB
		maxWidthOrHeight: 1920, // Max dimension
		useWebWorker: true,
		quality: 0.8, // High quality (0-1)
		initialQuality: 0.8,
	};

	try {
		console.log(`Original file size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);
		const compressedFile = await imageCompression(imageFile, options);
		console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
		return compressedFile;
	} catch (error) {
		console.error('Image compression failed:', error);
		throw new Error('Failed to compress image');
	}
}

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @param {string} token - Auth token
 * @returns {Promise<string>} - Cloudinary URL
 */
export async function uploadImageToCloudinary(file, token) {
	const formData = new FormData();
	formData.append('media', file);

	try {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/upload-media`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: formData
		});

		const data = await response.json();

		if (!response.ok || !data.success) {
			throw new Error(data.message || 'Upload failed');
		}

		return data.url;
	} catch (error) {
		console.error('Image upload failed:', error);
		throw new Error('Failed to upload image');
	}
}
