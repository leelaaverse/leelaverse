import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const Dashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: user?.profile?.firstName || '',
        lastName: user?.profile?.lastName || '',
        bio: user?.profile?.bio || '',
        location: user?.profile?.location || '',
        website: user?.profile?.website || '',
        socialLinks: {
            twitter: user?.profile?.socialLinks?.twitter || '',
            linkedin: user?.profile?.socialLinks?.linkedin || '',
            github: user?.profile?.socialLinks?.github || ''
        }
    });

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (data.success) {
                // Update user data would typically be handled by parent component
                alert('Profile updated successfully!');
            } else {
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            alert('Error updating profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setProfileData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'grid' },
        { id: 'profile', label: 'Profile', icon: 'user' },
        { id: 'security', label: 'Security', icon: 'shield' },
        { id: 'activity', label: 'Activity', icon: 'clock' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Welcome back, {user?.profile?.firstName || user?.username}!
                            </p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon
                                        name={tab.icon}
                                        className="w-5 h-5 mr-3"
                                    />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                                <Icon name="star" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                                    {user?.creatorStats?.totalPoints || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                <Icon name="trophy" className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
                                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                                    {user?.creatorStats?.level || 1}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <Icon name="calendar" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {formatDate(user?.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Info */}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Account Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Username:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white">{user?.username}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white">{user?.email}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Role:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white capitalize">{user?.role}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white">
                                                {user?.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                    Edit Profile
                                </h3>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            value={profileData.bio}
                                            onChange={(e) => handleInputChange('bio', e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Website
                                            </label>
                                            <input
                                                type="url"
                                                value={profileData.website}
                                                onChange={(e) => handleInputChange('website', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                placeholder="https://yourwebsite.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium text-gray-900 dark:text-white">
                                            Social Links
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Twitter
                                                </label>
                                                <input
                                                    type="url"
                                                    value={profileData.socialLinks.twitter}
                                                    onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="https://twitter.com/username"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    LinkedIn
                                                </label>
                                                <input
                                                    type="url"
                                                    value={profileData.socialLinks.linkedin}
                                                    onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="https://linkedin.com/in/username"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    GitHub
                                                </label>
                                                <input
                                                    type="url"
                                                    value={profileData.socialLinks.github}
                                                    onChange={(e) => handleInputChange('socialLinks.github', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="https://github.com/username"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                    Security Settings
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                                            Password
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Last changed: {user?.passwordChangedAt ? formatDate(user.passwordChangedAt) : 'Never'}
                                        </p>
                                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                                            Change Password
                                        </button>
                                    </div>

                                    <div>
                                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                                            Account Status
                                        </h4>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${user?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {user?.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                    Recent Activity
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <Icon name="login" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                Last login: {user?.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Last active: {user?.lastActiveAt ? formatDate(user.lastActiveAt) : 'Never'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <Icon name="user" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                Account created: {formatDate(user?.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;