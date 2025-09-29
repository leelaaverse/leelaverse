import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            console.log('Auth check - stored tokens:', { accessToken: !!storedAccessToken, refreshToken: !!storedRefreshToken });

            if (storedAccessToken) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                        headers: {
                            'Authorization': `Bearer ${storedAccessToken}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Profile fetch successful:', data.data.user);
                        setUser(data.data.user);
                        setAccessToken(storedAccessToken);
                        setRefreshToken(storedRefreshToken);
                    } else {
                        console.log('Profile fetch failed, attempting token refresh');
                        // Token might be expired, try to refresh
                        if (storedRefreshToken) {
                            await refreshAccessToken();
                        } else {
                            logout();
                        }
                    }
                } catch (error) {
                    console.error('Auth check error:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []); // Only run once on mount

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                const { user, accessToken, refreshToken } = data.data;

                // Update all auth states
                setUser(user);
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);

                // Store tokens in localStorage
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                console.log('Login successful, user set:', user);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                const { user, accessToken, refreshToken } = data.data;

                // Update all auth states
                setUser(user);
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);

                // Store tokens in localStorage
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                console.log('Registration successful, user set:', user);
                return { success: true };
            } else {
                return { success: false, message: data.message, errors: data.errors };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const logout = async () => {
        try {
            if (refreshToken) {
                await fetch(`${API_BASE_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ refreshToken })
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            setRefreshToken(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    };

    const refreshAccessToken = async () => {
        try {
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();

            if (data.success) {
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

                setAccessToken(newAccessToken);
                setRefreshToken(newRefreshToken);

                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                return newAccessToken;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            logout();
            return null;
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.data.user);
                return { success: true };
            } else {
                return { success: false, message: data.message, errors: data.errors };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const value = {
        user,
        loading,
        accessToken,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshAccessToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};