import React, { useState } from 'react';
import Icon from '../Icon';

const ProfileSettings = ({ currentUser, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        username: currentUser.username || '',
        firstName: currentUser.firstName || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        website: currentUser.website || '',
        avatar: currentUser.avatar || '',
        profileWallTheme: currentUser.profileWallTheme || 'gradient-purple',
    });

    const [activeSection, setActiveSection] = useState('profile');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl cabin-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Icon name="settings" className="w-6 h-6 text-purple-500" />
                        Edit Profile
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <Icon name="x" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Settings Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                    {[
                        { id: 'profile', label: 'Profile Info', icon: 'user' },
                        { id: 'appearance', label: 'Appearance', icon: 'palette' },
                        { id: 'privacy', label: 'Privacy', icon: 'shield' },
                    ].map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeSection === section.id
                                    ? 'border-purple-500 text-purple-600 dark:text-purple-400 cabin-semibold'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Icon name={section.icon} className="w-4 h-4" />
                            <span className="hidden sm:inline">{section.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="p-6 space-y-6">
                        {activeSection === 'profile' && (
                            <>
                                {/* Avatar */}
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-sm cabin-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Profile Picture
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={formData.avatar}
                                                alt="Avatar"
                                                className="w-20 h-20 rounded-full object-cover border-4 border-purple-500"
                                            />
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    name="avatar"
                                                    value={formData.avatar}
                                                    onChange={handleChange}
                                                    placeholder="Avatar URL"
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Upload feature coming soon
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {/* Basic Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className="text-sm cabin-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Username *
                                        </span>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm cabin-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Display Name
                                        </span>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        />
                                    </label>
                                </div>

                                {/* Bio */}
                                <label className="block">
                                    <span className="text-sm cabin-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                                        <span>Bio</span>
                                        <span className="text-xs text-gray-500">{formData.bio.length}/160</span>
                                    </span>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        maxLength={160}
                                        rows={3}
                                        placeholder="Tell us about yourself..."
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                    />
                                </label>

                                {/* Additional Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className="text-sm cabin-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Location
                                        </span>
                                        <div className="relative">
                                            <Icon name="map-pin" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="City, Country"
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </label>

                                    <label className="block">
                                        <span className="text-sm cabin-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Website
                                        </span>
                                        <div className="relative">
                                            <Icon name="link" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                placeholder="https://yourwebsite.com"
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </label>
                                </div>
                            </>
                        )}

                        {activeSection === 'appearance' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg cabin-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Icon name="palette" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        Profile Wall Theme
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Choose an aesthetic theme for your profile wall
                                    </p>

                                    {/* Theme Selection Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {[
                                            {
                                                id: 'gradient-purple',
                                                name: 'Purple Dream',
                                                preview: 'from-purple-500 via-indigo-500 to-blue-500'
                                            },
                                            {
                                                id: 'gradient-sunset',
                                                name: 'Sunset Vibes',
                                                preview: 'from-orange-400 via-pink-500 to-purple-600'
                                            },
                                            {
                                                id: 'gradient-ocean',
                                                name: 'Ocean Breeze',
                                                preview: 'from-cyan-400 via-blue-500 to-indigo-600'
                                            },
                                            {
                                                id: 'gradient-forest',
                                                name: 'Forest Mist',
                                                preview: 'from-green-400 via-emerald-500 to-teal-600'
                                            },
                                            {
                                                id: 'gradient-fire',
                                                name: 'Fire Glow',
                                                preview: 'from-red-500 via-orange-500 to-yellow-500'
                                            },
                                            {
                                                id: 'gradient-midnight',
                                                name: 'Midnight Sky',
                                                preview: 'from-gray-900 via-purple-900 to-indigo-900'
                                            },
                                            {
                                                id: 'gradient-rose',
                                                name: 'Rose Gold',
                                                preview: 'from-pink-400 via-rose-400 to-red-400'
                                            },
                                            {
                                                id: 'gradient-mint',
                                                name: 'Mint Fresh',
                                                preview: 'from-teal-300 via-green-300 to-emerald-400'
                                            },
                                            {
                                                id: 'gradient-cosmic',
                                                name: 'Cosmic Dust',
                                                preview: 'from-violet-600 via-fuchsia-500 to-pink-500'
                                            },
                                        ].map(theme => (
                                            <button
                                                key={theme.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, profileWallTheme: theme.id }))}
                                                className={`relative overflow-hidden rounded-xl transition-all ${formData.profileWallTheme === theme.id
                                                        ? 'ring-4 ring-purple-500 scale-105 shadow-lg'
                                                        : 'hover:scale-105 hover:shadow-md'
                                                    }`}
                                            >
                                                <div className={`h-24 bg-gradient-to-r ${theme.preview}`} />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <span className="text-white cabin-semibold text-sm px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                                                        {theme.name}
                                                    </span>
                                                </div>
                                                {formData.profileWallTheme === theme.id && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <Icon name="check" className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                    <h4 className="text-sm cabin-semibold text-gray-900 dark:text-white mb-2">Preview</h4>
                                    <div className={`h-32 rounded-xl bg-gradient-to-r ${formData.profileWallTheme === 'gradient-purple' ? 'from-purple-500 via-indigo-500 to-blue-500' :
                                            formData.profileWallTheme === 'gradient-sunset' ? 'from-orange-400 via-pink-500 to-purple-600' :
                                                formData.profileWallTheme === 'gradient-ocean' ? 'from-cyan-400 via-blue-500 to-indigo-600' :
                                                    formData.profileWallTheme === 'gradient-forest' ? 'from-green-400 via-emerald-500 to-teal-600' :
                                                        formData.profileWallTheme === 'gradient-fire' ? 'from-red-500 via-orange-500 to-yellow-500' :
                                                            formData.profileWallTheme === 'gradient-midnight' ? 'from-gray-900 via-purple-900 to-indigo-900' :
                                                                formData.profileWallTheme === 'gradient-rose' ? 'from-pink-400 via-rose-400 to-red-400' :
                                                                    formData.profileWallTheme === 'gradient-mint' ? 'from-teal-300 via-green-300 to-emerald-400' :
                                                                        formData.profileWallTheme === 'gradient-cosmic' ? 'from-violet-600 via-fuchsia-500 to-pink-500' :
                                                                            'from-purple-500 via-indigo-500 to-blue-500'
                                        } relative overflow-hidden`}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'privacy' && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <Icon name="shield" className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div>
                                            <h3 className="cabin-semibold text-gray-900 dark:text-white mb-1">
                                                Privacy Settings
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Control who can see your profile and content - coming soon
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl cabin-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl cabin-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            <Icon name="check" className="w-5 h-5" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
