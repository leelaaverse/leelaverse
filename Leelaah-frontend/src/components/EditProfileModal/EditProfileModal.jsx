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
            // Update basic profile
            await apiService.profile.updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                bio: formData.bio,
                location: formData.location,
                website: formData.website
            });

            // Update username if changed
            if (formData.username !== userProfile?.username) {
                await apiService.profile.updateUsername(formData.username);
            }

            // Update social links
            await apiService.profile.updateSocialLinks({
                twitterLink: formData.twitterLink,
                instagramLink: formData.instagramLink,
                linkedinLink: formData.linkedinLink,
                githubLink: formData.githubLink,
                discordLink: formData.discordLink
            });

            // Fetch updated profile
            const response = await apiService.auth.getProfile();
            const updatedUser = response.data.data.user;

            // Update Redux store
            dispatch(updateUser(updatedUser));

            // Update localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error) {
            console.error('Profile update failed:', error);
            setError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpdate = async (avatarUrl) => {
        setLoading(true);
        try {
            await apiService.profile.updateAvatar(avatarUrl);
            setFormData(prev => ({ ...prev, avatar: avatarUrl }));
            setSuccess('Avatar updated successfully!');
        } catch (error) {
            setError('Failed to update avatar');
        } finally {
            setLoading(false);
        }
    };

    const handleCoverUpdate = async (coverUrl) => {
        setLoading(true);
        try {
            await apiService.profile.updateCover(coverUrl);
            setFormData(prev => ({ ...prev, coverImage: coverUrl }));
            setSuccess('Cover image updated successfully!');
        } catch (error) {
            setError('Failed to update cover image');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="edit-profile-modal-overlay" onClick={onClose}>
            <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button className="close-btn" onClick={onClose}>
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
                        <button type="button" className="cancel-btn" onClick={onClose}>
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
