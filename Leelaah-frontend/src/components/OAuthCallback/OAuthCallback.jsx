import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthCallback = ({ onSuccess }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const success = searchParams.get('success');
            const accessToken = searchParams.get('access_token');
            const refreshToken = searchParams.get('refresh_token');
            const userParam = searchParams.get('user');
            const error = searchParams.get('error');

            // Clear OAuth in progress flag
            localStorage.removeItem('oauthInProgress');

            if (error) {
                console.error('OAuth error:', error);
                // Redirect to home with error
                navigate('/?auth_error=' + error);
                return;
            }

            if (success === 'true' && accessToken && refreshToken && userParam) {
                try {
                    // Parse user data
                    const user = JSON.parse(decodeURIComponent(userParam));

                    // Store tokens and user data
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    localStorage.setItem('user', JSON.stringify(user));

                    // Call success callback if provided
                    if (onSuccess) {
                        onSuccess({ user, accessToken, refreshToken });
                    }

                    // Redirect to home
                    navigate('/');
                } catch (error) {
                    console.error('Error processing OAuth callback:', error);
                    navigate('/?auth_error=processing_failed');
                }
            } else {
                // Invalid callback parameters
                navigate('/?auth_error=invalid_callback');
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate, onSuccess]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            fontFamily: 'Poppins, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '3px solid rgba(93, 95, 239, 0.3)',
                    borderTop: '3px solid #5d5fef',
                    borderRadius: '50%',
                    margin: '0 auto 20px',
                    animation: 'spin 1s linear infinite'
                }}>
                </div>
                <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>
                    Processing authentication...
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                    Please wait while we log you in
                </p>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default OAuthCallback;
