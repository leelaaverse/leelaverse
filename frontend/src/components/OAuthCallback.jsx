import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function OAuthCallback() {
    const { setUser, setAccessToken, setRefreshToken } = useAuth();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const success = urlParams.get('success');
            const accessToken = urlParams.get('access_token');
            const refreshToken = urlParams.get('refresh_token');
            const userData = urlParams.get('user');
            const error = urlParams.get('error');

            if (error) {
                console.error('OAuth error:', error);
                alert('Authentication failed. Please try again.');
                window.location.href = '/';
                return;
            }

            if (success === 'true' && accessToken && refreshToken && userData) {
                try {
                    // Parse user data
                    const user = JSON.parse(decodeURIComponent(userData));

                    // Store tokens in localStorage
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    // Update auth context
                    setUser(user);
                    setAccessToken(accessToken);
                    setRefreshToken(refreshToken);

                    console.log('OAuth login successful:', user);

                    // Redirect to dashboard or home
                    window.location.href = '/dashboard';

                } catch (err) {
                    console.error('Error parsing OAuth response:', err);
                    alert('Authentication failed. Please try again.');
                    window.location.href = '/';
                }
            } else {
                console.error('Invalid OAuth callback parameters');
                alert('Authentication failed. Please try again.');
                window.location.href = '/';
            }
        };

        handleOAuthCallback();
    }, [setUser, setAccessToken, setRefreshToken]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Completing sign in...
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we process your authentication.
                </p>
            </div>
        </div>
    );
}
