import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import apiService from '../../services/api';
import './Sidebar.css';

const Sidebar = ({ onNavigate }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'Dark');
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');

    // Fetch user profile with stats
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;

            setLoading(true);
            try {
                const response = await apiService.auth.getProfile();
                setUserStats(response.data.data.user);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [user]);

    // Handle logout
    const handleLogout = async () => {
        try {
            await apiService.auth.logout();
            dispatch(logout());
            // Close offcanvas
            const offcanvasElement = document.getElementById('offcanvasRight');
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        } catch (error) {
            console.error('Logout failed:', error);
            dispatch(logout());
        }
    };

    // Handle theme change
    const handleThemeChange = (e) => {
        const newTheme = e.target.value;
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        // TODO: Implement actual theme switching logic
    };

    // Handle language change
    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
        // TODO: Implement actual language switching logic
    };

    // Calculate AI credit usage percentage
    const calculateCreditUsage = () => {
        if (!userStats) return { used: 0, limit: 0, percentage: 0 };

        const used = userStats.dailyGenerationsUsed || 0;
        const limit = userStats.dailyGenerationsLimit || 10;
        const percentage = limit > 0 ? (used / limit) * 100 : 0;

        return { used, limit, percentage };
    };

    const creditUsage = calculateCreditUsage();

    // Format numbers (e.g., 2500 -> 2.5k)
    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    // Get display name
    const displayName = userStats
        ? `${userStats.firstName} ${userStats.lastName}`.trim()
        : user?.firstName || 'User';

    const username = userStats?.username || user?.username || 'username';
    const avatarUrl = userStats?.avatar || user?.avatar || '/assets/profile.png';

    return (
        <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="offcanvasRight"
            aria-labelledby="offcanvasRightLabel"
            data-bs-backdrop="false"
            data-bs-scroll="true"
        >
            <div className="offcanvas-header">
                <div className="d-flex gap-3 align-items-center">
                    <div className="sidebar-avatar">
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            onError={(e) => e.target.src = '/assets/profile.png'}
                        />
                    </div>
                    <div className="sidebar-user-info">
                        <h4 className="m-0 font-15 text-light fw-semibold">
                            {loading ? 'Loading...' : displayName}
                        </h4>
                        <p className="m-0 font-13 font-light-2">@{username}</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="btn-close btn-close-white"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
            </div>

            <div className="offcanvas-body">
                {/* Stats Row */}
                <div className="sidebar-stats">
                    <div className="stat-item">
                        <h4 className="stat-value">
                            {loading ? '...' : formatNumber(userStats?.totalCreations || 0)}
                        </h4>
                        <p className="stat-label">Posts</p>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <h4 className="stat-value">
                            {loading ? '...' : formatNumber(userStats?._count?.followers || 0)}
                        </h4>
                        <p className="stat-label">Followers</p>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <h4 className="stat-value">
                            {loading ? '...' : formatNumber(userStats?._count?.following || 0)}
                        </h4>
                        <p className="stat-label">Following</p>
                    </div>
                </div>

                {/* AI Credit Usage */}
                <div className="credit-card mt-4">
                    <div className="credit-header">
                        <div className="d-flex align-items-center gap-2">
                            <img src="/assets/data-usage.png" alt="AI Credits" width="20" height="20" />
                            <h4 className="font-14 fw-semibold m-0 text-light">AI Credit Usage</h4>
                        </div>
                        <span className="credit-tier">
                            {userStats?.subscriptionTier || 'Free'}
                        </span>
                    </div>

                    <div className="credit-progress-wrapper mt-2">
                        <div className="credit-labels">
                            <span className="font-12 font-light-2">
                                Used: {creditUsage.used}
                            </span>
                            <span className="font-12 font-light-2">
                                Limit: {creditUsage.limit}
                            </span>
                        </div>
                        <div className="custom-progress-bar">
                            <div
                                className="custom-progress-fill"
                                style={{ width: `${Math.min(creditUsage.percentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Coin Balance */}
                    <div className="coin-balance mt-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="font-13 font-light-2">Coin Balance</span>
                            <span className="font-14 text-light fw-semibold">
                                <i className="fa-solid fa-coins"></i> {userStats?.coinBalance || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="sidebar-nav mt-4">
                    <button className="sidebar-nav-item" onClick={() => {
                        if (onNavigate) {
                            onNavigate('profile');
                            // Close sidebar
                            const offcanvasElement = document.getElementById('offcanvasRight');
                            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                            if (bsOffcanvas) {
                                bsOffcanvas.hide();
                            }
                        }
                    }}>
                        <div className="nav-item-content">
                            <img src="/assets/lucide_user.png" alt="Profile" width="18" height="18" />
                            <span>View Profile</span>
                        </div>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>

                    <button className="sidebar-nav-item">
                        <div className="nav-item-content">
                            <img src="/assets/mdi_account-cog-outline.png" alt="Account" width="18" height="18" />
                            <span>Account Settings</span>
                        </div>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>

                    <button className="sidebar-nav-item">
                        <div className="nav-item-content">
                            <img src="/assets/line-md_discord.png" alt="Discord" width="18" height="18" />
                            <span>Join Discord</span>
                        </div>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>

                    {/* Theme Selector */}
                    <div className="sidebar-nav-item-select">
                        <div className="nav-item-content">
                            <img src="/assets/fluent_dark-theme-20-filled.png" alt="Theme" width="18" height="18" />
                            <span>Theme</span>
                        </div>
                        <select
                            className="sidebar-select"
                            value={theme}
                            onChange={handleThemeChange}
                        >
                            <option value="Light">Light</option>
                            <option value="Dark">Dark</option>
                            <option value="Auto">Auto</option>
                        </select>
                    </div>

                    {/* Language Selector */}
                    <div className="sidebar-nav-item-select">
                        <div className="nav-item-content">
                            <img src="/assets/clarity_language-line.png" alt="Language" width="18" height="18" />
                            <span>Language</span>
                        </div>
                        <select
                            className="sidebar-select"
                            value={language}
                            onChange={handleLanguageChange}
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Spanish">Spanish</option>
                        </select>
                    </div>

                    <button className="sidebar-nav-item">
                        <div className="nav-item-content">
                            <img src="/assets/ix_support.png" alt="Support" width="18" height="18" />
                            <span>Help & Support</span>
                        </div>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>

                {/* Logout Button */}
                <div className="sidebar-logout mt-4">
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
