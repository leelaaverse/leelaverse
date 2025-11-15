import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from '../../store/slices/authSlice';
import Navbar from '../Navbar/Navbar';
import MainContent from '../MainContent/MainContent';
import FloatingBar from '../FloatingBar/FloatingBar';
import Sidebar from '../Sidebar/Sidebar';
import AuthModal from '../AuthModal/AuthModal';
import './HomeFeed.css';

const HomeFeed = () => {
    const dispatch = useDispatch();
    const { isLoggedIn } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('featured');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

    // Check if user is already logged in on component mount
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (accessToken && storedUser) {
            dispatch(setAuth({
                user: JSON.parse(storedUser),
                token: accessToken
            }));
        }
    }, [dispatch]);

    // Handle OAuth callback
    useEffect(() => {
        const handleOAuthCallback = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const success = urlParams.get('success');
            const accessToken = urlParams.get('access_token');
            const refreshToken = urlParams.get('refresh_token');
            const userParam = urlParams.get('user');
            const error = urlParams.get('error');

            if (error) {
                console.error('OAuth error:', error);
                alert('Authentication failed. Please try again.');
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            if (success === 'true' && accessToken && refreshToken && userParam) {
                setIsProcessingOAuth(true);
                try {
                    // Parse user data
                    const user = JSON.parse(decodeURIComponent(userParam));

                    // Store tokens and user data
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    localStorage.setItem('user', JSON.stringify(user));

                    // Update Redux state
                    dispatch(setAuth({
                        user: user,
                        token: accessToken
                    }));

                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);

                    console.log('✅ OAuth authentication successful!');
                } catch (error) {
                    console.error('Error processing OAuth callback:', error);
                    alert('Error processing authentication. Please try again.');
                } finally {
                    setIsProcessingOAuth(false);
                }
            }
        };

        handleOAuthCallback();
    }, []);

    const handleLogin = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    };

    const handleSignup = () => {
        setAuthMode('signup');
        setIsAuthModalOpen(true);
    };

    const handleAuthSuccess = (data) => {
        console.log('Authentication successful:', data);
        dispatch(setAuth({
            user: data.user,
            token: data.accessToken
        }));
        setIsAuthModalOpen(false);
    };

    const handleCloseModal = () => {
        setIsAuthModalOpen(false);
    };

    const handleOpenAuth = (mode = 'signup') => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
    };

    return (
        <div className="home-feed">
            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isLoggedIn={isLoggedIn}
                onLogin={handleLogin}
                onSignup={handleSignup}
            />
            <MainContent activeTab={activeTab} />
            <FloatingBar onOpenAuth={handleOpenAuth} />
            <Sidebar />

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={handleCloseModal}
                mode={authMode}
                onSuccess={handleAuthSuccess}
            />

            {/* OAuth Processing Overlay */}
            {isProcessingOAuth && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(8px)'
                }}>
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '3px solid rgba(93, 95, 239, 0.3)',
                            borderTop: '3px solid #5d5fef',
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <h2 style={{ fontSize: '20px', marginBottom: '10px', fontFamily: 'Poppins, sans-serif' }}>
                            Processing authentication...
                        </h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', fontFamily: 'Poppins, sans-serif' }}>
                            Please wait while we log you in
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeFeed;
