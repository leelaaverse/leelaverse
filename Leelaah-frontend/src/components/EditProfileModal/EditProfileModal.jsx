import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import apiService from '../../services/api';
import './EditProfileModal.css';

const EditProfileModal = ({ isOpen, onClose, userProfile }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        bio: '',
        location: '',
        website: '',
        avatar: '',
        coverImage: '',
        twitterLink: '',
        instagramLink: '',
        linkedinLink: '',
        githubLink: '',
        discordLink: ''
    });

    const [activeTab, setActiveTab] = useState('basic'); // basic, social, advanced
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setFormData({
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                username: userProfile.username || '',
                bio: userProfile.bio || '',
                location: userProfile.location || '',
                website: userProfile.website || '',
                avatar: userProfile.avatar || '',
                coverImage: userProfile.coverImage || '',
                twitterLink: userProfile.twitterLink || '',
                instagramLink: userProfile.instagramLink || '',
                linkedinLink: userProfile.linkedinLink || '',
                githubLink: userProfile.githubLink || '',
                discordLink: userProfile.discordLink || ''
            });
        }
    }, [userProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const checkUsernameAvailability = async (username) => {
        if (username === userProfile?.username) {
            setUsernameAvailable(null);
            return;
        }

        if (username.length < 3) {
            setUsernameAvailable(false);
            return;
        }

        setCheckingUsername(true);
        try {
            const response = await apiService.profile.checkUsername(username);
            setUsernameAvailable(response.data.available);
        } catch (error) {
            console.error('Username check failed:', error);
        } finally {
            setCheckingUsername(false);
        }
    };

    const handleUsernameChange = (e) => {
        const username = e.target.value;
        setFormData(prev => ({ ...prev, username }));

        // Debounce username check
        const timeoutId = setTimeout(() => {
            if (username) {
                checkUsernameAvailability(username);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('🔄 Starting profile update...');

            // Update basic profile
            console.log('📝 Updating basic profile info...');

            // Only include fields that have values to avoid validation errors
            const profileUpdateData = {};
            if (formData.firstName?.trim()) profileUpdateData.firstName = formData.firstName.trim();
            if (formData.lastName?.trim()) profileUpdateData.lastName = formData.lastName.trim();
            if (formData.bio?.trim()) profileUpdateData.bio = formData.bio.trim();
            if (formData.location?.trim()) profileUpdateData.location = formData.location.trim();
            if (formData.website?.trim()) profileUpdateData.website = formData.website.trim();

            const profileResponse = await apiService.profile.updateProfile(profileUpdateData);
            console.log('✅ Basic profile updated:', profileResponse.data);

            // Update username if changed
            if (formData.username !== userProfile?.username) {
                console.log('👤 Updating username...');
                const usernameResponse = await apiService.profile.updateUsername(formData.username);
                console.log('✅ Username updated:', usernameResponse.data);
            }

            // Update social links - only if any social link has a value
            const hasSocialLinks = formData.twitterLink || formData.instagramLink ||
                formData.linkedinLink || formData.githubLink ||
                formData.discordLink;

            if (hasSocialLinks) {
                console.log('🔗 Updating social links...');
                const socialUpdateData = {};
                if (formData.twitterLink?.trim()) socialUpdateData.twitterLink = formData.twitterLink.trim();
                if (formData.instagramLink?.trim()) socialUpdateData.instagramLink = formData.instagramLink.trim();
                if (formData.linkedinLink?.trim()) socialUpdateData.linkedinLink = formData.linkedinLink.trim();
                if (formData.githubLink?.trim()) socialUpdateData.githubLink = formData.githubLink.trim();
                if (formData.discordLink?.trim()) socialUpdateData.discordLink = formData.discordLink.trim();

                const socialResponse = await apiService.profile.updateSocialLinks(socialUpdateData);
                console.log('✅ Social links updated:', socialResponse.data);
            } else {
                console.log('ℹ️ No social links to update');
            }

            // Update avatar if changed
            if (formData.avatar && formData.avatar !== userProfile?.avatar) {
                console.log('🖼️ Updating avatar...');
                await apiService.profile.updateAvatar(formData.avatar);
            }

            // Fetch updated profile
            console.log('🔄 Fetching updated profile...');
            const response = await apiService.auth.getProfile();
            const updatedUser = response.data.data.user;
            console.log('✅ Updated profile fetched:', updatedUser);

            // Update Redux store
            dispatch(updateUser(updatedUser));

            // Update localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setSuccess('Profile updated successfully!');

            // Close modal and trigger parent refresh
            setTimeout(() => {
                onClose(true); // Pass true to indicate successful update
            }, 1500);

        } catch (error) {
            console.error('❌ Profile update failed:', error);
            console.error('Error details:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpdate = async (avatarUrl) => {
        setLoading(true);
        setError('');
        try {
            console.log('🖼️ Updating avatar:', avatarUrl);
            const response = await apiService.profile.updateAvatar(avatarUrl);
            console.log('✅ Avatar updated:', response.data);

            setFormData(prev => ({ ...prev, avatar: avatarUrl }));

            // Update Redux and localStorage
            const updatedUser = response.data.data.user;
            dispatch(updateUser(updatedUser));
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setSuccess('Avatar updated successfully!');
        } catch (error) {
            console.error('❌ Avatar update failed:', error);
            setError(error.response?.data?.message || 'Failed to update avatar');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setUploadingAvatar(true);
        setError('');

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;
                setAvatarPreview(base64Image);

                // Upload to backend
                console.log('📤 Uploading avatar...');
                const response = await apiService.profile.uploadAvatar(base64Image);
                console.log('✅ Avatar uploaded:', response.data);

                const updatedUser = response.data.data.user;
                setFormData(prev => ({ ...prev, avatar: updatedUser.avatar }));

                // Update Redux and localStorage
                dispatch(updateUser(updatedUser));
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setSuccess('Avatar uploaded successfully!');
                setTimeout(() => setSuccess(''), 3000);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('❌ Avatar upload failed:', error);
            setError(error.response?.data?.message || 'Failed to upload avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleClose = () => {
        onClose(false); // Pass false to indicate no update was made
    };

    if (!isOpen) return null;

    return (
        <div className="edit-profile-modal-overlay" onClick={handleClose}>
            <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button className="close-btn" onClick={handleClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="modal-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
                        onClick={() => setActiveTab('basic')}
                    >
                        <i className="fa-solid fa-user"></i>
                        Basic Info
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
                        onClick={() => setActiveTab('social')}
                    >
                        <i className="fa-solid fa-share-nodes"></i>
                        Social Links
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
                        onClick={() => setActiveTab('advanced')}
                    >
                        <i className="fa-solid fa-sliders"></i>
                        Advanced
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <div className="tab-content">
                            <div className="form-group">
                                <label>Avatar</label>
                                <div className="image-upload-container">
                                    <div className="image-preview">
                                        <img
                                            src={avatarPreview || formData.avatar || 'https://via.placeholder.com/120'}
                                            alt="Avatar preview"
                                            className="avatar-preview-img"
                                        />
                                        {uploadingAvatar && (
                                            <div className="upload-overlay">
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                <span>Uploading...</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="upload-actions">
                                        <label htmlFor="avatar-upload" className="upload-btn">
                                            <i className="fa-solid fa-upload"></i>
                                            Upload Avatar
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarFileChange}
                                            style={{ display: 'none' }}
                                            disabled={uploadingAvatar}
                                        />
                                        <p className="upload-hint">JPG, PNG or GIF. Max 5MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter your first name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter your last name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Username</label>
                                <div className="username-input-group">
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleUsernameChange}
                                        placeholder="Enter username"
                                    />
                                    {checkingUsername && <span className="checking">Checking...</span>}
                                    {usernameAvailable === true && <span className="available">✓ Available</span>}
                                    {usernameAvailable === false && <span className="unavailable">✗ Taken</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us about yourself..."
                                    rows="4"
                                    maxLength="500"
                                />
                                <span className="char-count">{formData.bio.length}/500</span>
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Where are you based?"
                                />
                            </div>

                            <div className="form-group">
                                <label>Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>
                    )}

                    {/* Social Links Tab */}
                    {activeTab === 'social' && (
                        <div className="tab-content">
                            <div className="form-group">
                                <label>
                                    <i className="fa-brands fa-twitter"></i>
                                    Twitter
                                </label>
                                <input
                                    type="url"
                                    name="twitterLink"
                                    value={formData.twitterLink}
                                    onChange={handleChange}
                                    placeholder="https://twitter.com/username"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className="fa-brands fa-instagram"></i>
                                    Instagram
                                </label>
                                <input
                                    type="url"
                                    name="instagramLink"
                                    value={formData.instagramLink}
                                    onChange={handleChange}
                                    placeholder="https://instagram.com/username"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className="fa-brands fa-linkedin"></i>
                                    LinkedIn
                                </label>
                                <input
                                    type="url"
                                    name="linkedinLink"
                                    value={formData.linkedinLink}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className="fa-brands fa-github"></i>
                                    GitHub
                                </label>
                                <input
                                    type="url"
                                    name="githubLink"
                                    value={formData.githubLink}
                                    onChange={handleChange}
                                    placeholder="https://github.com/username"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className="fa-brands fa-discord"></i>
                                    Discord
                                </label>
                                <input
                                    type="text"
                                    name="discordLink"
                                    value={formData.discordLink}
                                    onChange={handleChange}
                                    placeholder="username#1234"
                                />
                            </div>
                        </div>
                    )}

                    {/* Advanced Tab */}
                    {activeTab === 'advanced' && (
                        <div className="tab-content">
                            <div className="form-group">
                                <label>Avatar URL</label>
                                <input
                                    type="url"
                                    name="avatar"
                                    value={formData.avatar}
                                    onChange={handleChange}
                                    placeholder="https://example.com/avatar.jpg"
                                />
                                {formData.avatar && (
                                    <div className="image-preview">
                                        <img src={formData.avatar} alt="Avatar preview" />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Cover Image URL</label>
                                <input
                                    type="url"
                                    name="coverImage"
                                    value={formData.coverImage}
                                    onChange={handleChange}
                                    placeholder="https://example.com/cover.jpg"
                                />
                                {formData.coverImage && (
                                    <div className="image-preview cover">
                                        <img src={formData.coverImage} alt="Cover preview" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {/* Actions */}
                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={handleClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={loading || (formData.username !== userProfile?.username && !usernameAvailable)}
                        >
                            {loading ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check"></i>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
