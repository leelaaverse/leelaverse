import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { fetchUnreadCount, addRealtimeNotification } from '../../store/slices/notificationSlice';
import { IoChatbubbleEllipsesOutline, IoNotificationsOutline } from 'react-icons/io5';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { PiCoinsBold } from 'react-icons/pi';
import { HiOutlineSparkles } from 'react-icons/hi';
import socketService from '../../services/socket';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import NotificationDropdown from './NotificationDropdown';
import './Navbar.css';

const Navbar = ({ activeTab, setActiveTab, isLoggedIn = false, onLogin, onSignup, showBackButton = false, onBack, onChatClick, onNavigate }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.theme);
    const { unreadCount: unreadNotifications } = useSelector((state) => state.notifications);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [userStats, setUserStats] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dropdownRef = useRef(null);
    const avatarBtnRef = useRef(null);
    const notifRef = useRef(null);
    const notifBtnRef = useRef(null);

    // Determine actual dark mode state
    useEffect(() => {
        const updateDarkMode = () => {
            if (theme === 'Dark') setIsDarkMode(true);
            else if (theme === 'Light') setIsDarkMode(false);
            else setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        };
        updateDarkMode();
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => { if (theme === 'Auto') updateDarkMode(); };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Subscribe to socket notifications
    useEffect(() => {
        if (!isLoggedIn) return;
        // Fetch initial unread count from backend
        dispatch(fetchUnreadCount());
        const handleNewMessage = () => setUnreadMessages(prev => prev + 1);
        const handleNewNotification = (notif) => {
            dispatch(addRealtimeNotification(notif));
        };
        socketService.onNewMessageNotification(handleNewMessage);
        socketService.onNotification(handleNewNotification);
        return () => {
            socketService.off('new:message:notification', handleNewMessage);
            socketService.off('new:notification', handleNewNotification);
        };
    }, [isLoggedIn, dispatch]);

    // Fetch user stats for credit usage
    useEffect(() => {
        if (!isLoggedIn || !user) return;
        const fetchStats = async () => {
            try {
                const response = await apiService.auth.getProfile();
                setUserStats(response.data.data.user);
            } catch (err) {
                console.error('Failed to fetch user stats:', err);
            }
        };
        fetchStats();
    }, [isLoggedIn, user]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                avatarBtnRef.current && !avatarBtnRef.current.contains(e.target)
            ) {
                setIsDropdownOpen(false);
            }
            if (
                notifRef.current && !notifRef.current.contains(e.target) &&
                notifBtnRef.current && !notifBtnRef.current.contains(e.target)
            ) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChatClick = () => {
        setUnreadMessages(0);
        if (onChatClick) onChatClick();
    };

    const handleNotificationClick = () => {
        setIsNotifOpen(prev => !prev);
        setIsDropdownOpen(false); // close profile dropdown
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        toast.loading('Logging out...', { id: 'logout' });
        try {
            await apiService.auth.logout();
            dispatch(logout());
            toast.success('Logged out successfully!', { id: 'logout' });
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed, clearing session', { id: 'logout' });
            dispatch(logout());
        } finally {
            setIsLoggingOut(false);
            setIsDropdownOpen(false);
        }
    };

    const handleDropdownNav = useCallback((view) => {
        setIsDropdownOpen(false);
        if (onNavigate) onNavigate(view);
    }, [onNavigate]);

    const coinBalance = userStats?.coinBalance || 0;
    const avatarUrl = userStats?.avatar || user?.avatar || '/assets/profile.png';
    const displayUsername = userStats?.username || user?.username || 'user';

    return (
        <nav className="navbar navbar-expand-lg sticky-top py-2 bg-mainColor Header">
            <div className="container-fluid px-4 d-flex align-items-center">
                {/* Back Button or Logo */}
                {showBackButton ? (
                    <button className="navbar-back-btn d-flex align-items-center" onClick={onBack}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span className="ms-2">Back to Home</span>
                    </button>
                ) : (
                    <button
                        className="navbar-brand d-flex align-items-center"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        onClick={() => onNavigate?.('home')}
                    >
                        <img
                            src={isDarkMode ? '/assets/Logo-leela-black.jpg' : '/assets/Logo-leela-white.jpg'}
                            alt="LELAA Logo"
                            className="img-fluid"
                            style={{ maxHeight: '60px' }}
                        />
                    </button>
                )}

                {/* Spacer */}
                <div className="flex-grow-1" />

                {/* Right Icons */}
                {isLoggedIn && (
                    <div className="d-flex align-items-center bg-dark-2 px-4 py-2 rounded-pill navigationRight gap-3" style={{ flexShrink: 0 }}>
                        <button title="Messages" onClick={handleChatClick} className="position-relative">
                            <IoChatbubbleEllipsesOutline size={22} />
                            {unreadMessages > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem', padding: '0.25em 0.4em' }}>
                                    {unreadMessages > 9 ? '9+' : unreadMessages}
                                </span>
                            )}
                        </button>
                        <div style={{ position: 'relative' }} ref={notifRef}>
                            <button ref={notifBtnRef} title="Notifications" onClick={handleNotificationClick} className="position-relative">
                                <IoNotificationsOutline size={22} />
                                {unreadNotifications > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem', padding: '0.25em 0.4em' }}>
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </span>
                                )}
                            </button>
                            <NotificationDropdown
                                isOpen={isNotifOpen}
                                onClose={() => setIsNotifOpen(false)}
                                onNavigate={(view, id) => { setIsNotifOpen(false); onNavigate?.(view, id); }}
                                isDarkMode={isDarkMode}
                            />
                        </div>

                        {/* Profile Avatar (replaces hamburger) */}
                        <div className="relative">
                            <button
                                ref={avatarBtnRef}
                                title="Profile"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="profile-avatar-btn"
                            >
                                <img
                                    src={avatarUrl}
                                    alt={displayUsername}
                                    onError={(e) => e.target.src = '/assets/profile.png'}
                                />
                                <span className={`profile-avatar-ring ${isDropdownOpen ? 'active' : ''}`} />
                            </button>

                            {/* Profile Dropdown */}
                            {isDropdownOpen && (
                                <div
                                    ref={dropdownRef}
                                    className={`profile-dropdown ${isDarkMode ? 'dark' : 'light'}`}
                                >
                                    {/* User info card */}
                                    <div className="pd-user-card">
                                        <div className="pd-user-avatar">
                                            <img src={avatarUrl} alt="" onError={(e) => e.target.src = '/assets/profile.png'} />
                                        </div>
                                        <div className="pd-user-details">
                                            <p className="pd-user-name">
                                                {userStats?.firstName || user?.firstName || 'User'} {userStats?.lastName || user?.lastName || ''}
                                            </p>
                                            <p className="pd-user-coins">
                                                <PiCoinsBold size={13} className="pd-coin-icon" />
                                                {coinBalance} coins
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pd-divider" />

                                    {/* Menu items */}
                                    <div className="pd-menu">
                                        <button className="pd-menu-item" onClick={() => handleDropdownNav('profile')}>
                                            <FiUser size={15} />
                                            <span>View profile</span>
                                        </button>
                                        <button className="pd-menu-item" onClick={() => handleDropdownNav('coinStore')}>
                                            <PiCoinsBold size={15} />
                                            <span>Coin store</span>
                                        </button>
                                        <button className="pd-menu-item" onClick={() => handleDropdownNav('aiStudio')}>
                                            <HiOutlineSparkles size={15} />
                                            <span>AI Studio</span>
                                        </button>
                                        <button className="pd-menu-item" onClick={() => handleDropdownNav('settings')}>
                                            <FiSettings size={15} />
                                            <span>Advanced settings</span>
                                        </button>
                                    </div>

                                    <div className="pd-divider" />

                                    {/* Sign out */}
                                    <div className="pd-menu">
                                        <button
                                            className="pd-menu-item pd-signout"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                        >
                                            <FiLogOut size={15} />
                                            <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Login / Signup for unauthenticated users */}
                {!isLoggedIn && (
                    <div className="d-flex align-items-center bg-dark-2 px-3 py-2 rounded-pill" style={{ flexShrink: 0, gap: 8 }}>
                        <button
                            onClick={onLogin}
                            style={{
                                background: '#4338ca',
                                border: 'none',
                                color: '#fff',
                                borderRadius: 999,
                                padding: '6px 20px',
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#4338ca'}
                        >
                            Login
                        </button>
                        <button
                            onClick={onSignup}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text)',
                                padding: '6px 16px',
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            Sign up
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
