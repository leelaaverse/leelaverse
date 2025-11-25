const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {string} base64Image - Base64 encoded image
 * @param {string} folder - Folder path in Cloudinary
 * @param {string} publicId - Optional public ID for the image
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadImage = async (base64Image, folder = 'leelaverse', publicId = null) => {
    try {
        const uploadOptions = {
            folder,
            resource_type: 'auto',
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
            uploadOptions.overwrite = true;
        }

        const result = await cloudinary.uploader.upload(base64Image, uploadOptions);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: result.result === 'ok',
            result: result.result
        };
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};

/**
 * Upload avatar image
 * @param {string} base64Image - Base64 encoded image
 * @param {string} userId - User ID for unique filename
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadAvatar = async (base64Image, userId) => {
    return uploadImage(
        base64Image,
        'leelaverse/avatars',
        `avatar_${userId}_${Date.now()}`
    );
};

/**
 * Upload cover image
 * @param {string} base64Image - Base64 encoded image
 * @param {string} userId - User ID for unique filename
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadCoverImage = async (base64Image, userId) => {
    return uploadImage(
        base64Image,
        'leelaverse/covers',
        `cover_${userId}_${Date.now()}`
    );
};

/**
 * Upload post image
 * @param {string} base64Image - Base64 encoded image
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadPostImage = async (base64Image, userId) => {
    return uploadImage(
        base64Image,
        'leelaverse/posts',
        `post_${userId}_${Date.now()}`
    );
};

module.exports = {
    cloudinary,
    uploadImage,
    deleteImage,
    uploadAvatar,
    uploadCoverImage,
    uploadPostImage
};
