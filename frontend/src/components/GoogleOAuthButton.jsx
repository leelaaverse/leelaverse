import { useState } from 'react';
import Icon from './Icon';

const GoogleOAuthButton = ({
    mode = 'login', // 'login' or 'signup'
    className = '',
    disabled = false,
    onError = null
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleAuth = async () => {
        if (disabled || isLoading) return;

        setIsLoading(true);

        try {
            // Get the backend URL from environment or default
            const backendURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            // Redirect to Google OAuth endpoint
            const oauthURL = `${backendURL}/api/oauth/google`;

            console.log('Redirecting to Google OAuth:', oauthURL);

            // Store the current page to return to after auth (optional)
            sessionStorage.setItem('oauth_return_url', window.location.pathname);

            // Redirect to Google OAuth
            window.location.href = oauthURL;

        } catch (error) {
            console.error('Google OAuth error:', error);
            setIsLoading(false);

            if (onError) {
                onError('Failed to initiate Google authentication. Please try again.');
            }
        }
    };

    const buttonText = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google';
    const loadingText = mode === 'signup' ? 'Signing up...' : 'Signing in...';

    return (
        <button
            onClick={handleGoogleAuth}
            disabled={disabled || isLoading}
            className={`
                flex items-center justify-center px-4 py-3
                border border-gray-200 dark:border-gray-600
                rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700
                transition-colors duration-300
                cabin-semibold font-semibold
                text-gray-700 dark:text-gray-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                    {loadingText}
                </>
            ) : (
                <>
                    <Icon name="globe" className="w-4 h-4 mr-2" />
                    {buttonText}
                </>
            )}
        </button>
    );
};

export default GoogleOAuthButton;
