import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../../services/socket';
import './Navbar.css';

const Navbar = ({ activeTab, setActiveTab, isLoggedIn = false, onLogin, onSignup, showBackButton = false, onBack, onChatClick }) => {
    const { theme } = useSelector((state) => state.theme);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    // Subscribe to socket notifications
    useEffect(() => {
        if (!isLoggedIn) return;

        const handleNewMessage = () => {
            setUnreadMessages(prev => prev + 1);
        };

        const handleNewNotification = () => {
            setUnreadNotifications(prev => prev + 1);
        };

        socketService.onNewMessageNotification(handleNewMessage);
        socketService.onNotification(handleNewNotification);

        return () => {
            socketService.off('new:message:notification', handleNewMessage);
            socketService.off('new:notification', handleNewNotification);
        };
    }, [isLoggedIn]);

    const handleChatClick = () => {
        setUnreadMessages(0);
        onChatClick();
    };

    const handleNotificationClick = () => {
        setUnreadNotifications(0);
        // Future: Open notification dropdown/page
    };

    return (
        <nav className="navbar navbar-expand-lg sticky-top py-2 bg-mainColor Header">
            <div className="container-fluid flex-wrap px-4">
                {/* Back Button or Logo */}
                {showBackButton ? (
                    <button
                        className="navbar-back-btn d-flex align-items-center order-1 order-lg-1"
                        onClick={onBack}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        <span className="ms-2">Back to Home</span>
                    </button>
                ) : (
                    <a
                        className="navbar-brand d-flex align-items-center order-1 order-lg-1"
                        href="#"
                    >
                        <img
                            src={
                                theme === 'Light' || (theme === 'Auto' && !document.documentElement.classList.contains('dark'))
                                    ? '/assets/Logo-leela-white.jpg'
                                    : '/assets/Logo-leela-black.jpg'
                            }
                            alt="LELAA Logo"
                            className="img-fluid"
                            style={{ maxHeight: '60px' }} // Adjusted max-height so these big images don't overshadow header
                        />
                    </a>
                )}

                {/* Navigation - Show login/signup if not logged in, otherwise show tabs */}
                <div className="justify-content-center order-3 order-lg-2" id="navbarMain">
                    <ul
                        className="nav nav-pills flex-row bg-dark-2 py-2 px-5 gap-3 rounded-pill flex-wrap justify-content-center mb-2 mb-lg-0"
                        id="pills-tab"
                        role="tablist"
                    >
                        {!isLoggedIn ? (
                            <>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className="nav-link active"
                                        onClick={onLogin}
                                        type="button"
                                        role="tab"
                                    >
                                        Login
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className="nav-link"
                                        onClick={onSignup}
                                        type="button"
                                        role="tab"
                                    >
                                        Sign up
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeTab === 'featured' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('featured')}
                                        type="button"
                                        role="tab"
                                    >
                                        Featured
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeTab === 'trending' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('trending')}
                                        type="button"
                                        role="tab"
                                    >
                                        Trending
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeTab === 'following' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('following')}
                                        type="button"
                                        role="tab"
                                    >
                                        Following
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Right Icons - Only show when logged in */}
                {isLoggedIn && (
                    <div className="d-flex align-items-center justify-content-end bg-dark-2 px-md-5 py-md-3 px-lg-5 py-lg-3 px-sm-5 py-sm-2 px-3 py-2 rounded-pill navigationRight ms-2 gap-lg-4 gap-md-4 gap-sm-3 gap-3 order-2 order-lg-3">
                        <button title="Messages" onClick={handleChatClick} className="position-relative">
                            <i className="fa-regular fa-comment-dots"></i>
                            {unreadMessages > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem', padding: '0.25em 0.4em' }}>
                                    {unreadMessages > 9 ? '9+' : unreadMessages}
                                </span>
                            )}
                        </button>
                        <button title="Notifications" onClick={handleNotificationClick} className="position-relative">
                            <i className="fa-regular fa-bell"></i>
                            {unreadNotifications > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem', padding: '0.25em 0.4em' }}>
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvasRight"
                            aria-controls="offcanvasRight"
                            data-bs-backdrop="false"
                            title="Menu"
                        >
                            <i className="fa-solid fa-bars"></i>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
