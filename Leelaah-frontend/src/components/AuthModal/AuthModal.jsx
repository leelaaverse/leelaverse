import React, { useState, useRef, useEffect, useCallback } from 'react';
import apiService from '../../services/api';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, mode, onSuccess }) => {
    // 'login' | 'signup' | 'forgot' | 'resetSent' | 'otp' | 'congrats'
    const [viewMode, setViewMode] = useState(mode === 'login' ? 'login' : 'signup');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        firstName: '',
        lastName: ''
    });
    const [forgotEmail, setForgotEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // OTP state
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [otpEmail, setOtpEmail] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);
    const [pendingAuthData, setPendingAuthData] = useState(null);
    const [bonusCoins, setBonusCoins] = useState(500);
    const otpRefs = useRef([]);

    const isLogin = viewMode === 'login';

    // Update mode when prop changes
    useEffect(() => {
        setViewMode(mode === 'login' ? 'login' : 'signup');
    }, [mode]);

    // OTP countdown timer
    useEffect(() => {
        if (otpTimer <= 0) return;
        const interval = setInterval(() => {
            setOtpTimer((t) => (t <= 1 ? 0 : t - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [otpTimer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!isLogin) {
            if (!formData.username) {
                newErrors.username = 'Username is required';
            } else if (formData.username.length < 3) {
                newErrors.username = 'Username must be at least 3 characters';
            }
            if (!formData.firstName) {
                newErrors.firstName = 'First name is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : {
                    email: formData.email,
                    password: formData.password,
                    username: formData.username,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                };

            const response = await fetch(`${baseURL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store tokens immediately
                if (data.data?.accessToken) localStorage.setItem('accessToken', data.data.accessToken);
                if (data.data?.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);
                if (data.data?.user) localStorage.setItem('user', JSON.stringify(data.data.user));

                // If signup, show OTP verification
                if (!isLogin && data.data?.requiresOTP) {
                    setOtpEmail(formData.email);
                    setPendingAuthData(data.data);
                    setOtpDigits(['', '', '', '', '', '']);
                    setOtpTimer(60);
                    setViewMode('otp');
                    setErrorMessage('');
                    setSuccessMessage('');
                } else {
                    // Login success
                    setSuccessMessage(data.message || 'Login successful!');
                    setTimeout(() => {
                        onSuccess(data.data);
                        handleClose();
                    }, 1500);
                }
            } else {
                // Extract specific validation error messages if available
                let errMsg = data.message || 'Something went wrong. Please try again.';
                if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    errMsg = data.errors.map((e) => e.message).join('. ');
                }
                setErrorMessage(errMsg);
            }
        } catch (error) {
            console.error('Auth error:', error);
            setErrorMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ─── OTP Input Handlers ───
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only digits
        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1);
        setOtpDigits(newDigits);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newDigits = [...otpDigits];
        for (let i = 0; i < pasted.length; i++) {
            newDigits[i] = pasted[i];
        }
        setOtpDigits(newDigits);
        const nextEmpty = newDigits.findIndex((d) => !d);
        otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    };

    const handleVerifyOTP = async () => {
        const otp = otpDigits.join('');
        if (otp.length !== 6) {
            setErrorMessage('Please enter all 6 digits');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const res = await apiService.auth.verifyOTP({ email: otpEmail, otp });
            if (res.data.success) {
                setBonusCoins(res.data.data.bonusCoins || 500);
                // Update local data with verified user
                const verifiedUser = res.data.data.user;
                if (verifiedUser) {
                    localStorage.setItem('user', JSON.stringify(verifiedUser));
                }
                setViewMode('congrats');
                setErrorMessage('');
            } else {
                setErrorMessage(res.data.message || 'Verification failed');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (otpTimer > 0) return;
        setIsLoading(true);
        setErrorMessage('');

        try {
            await apiService.auth.resendOTP({ email: otpEmail });
            setOtpTimer(60);
            setOtpDigits(['', '', '', '', '', '']);
            setSuccessMessage('New code sent to your email!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCongratsClose = () => {
        if (pendingAuthData) {
            // Re-fetch the profile to get the verified user with coins
            const fetchAndComplete = async () => {
                try {
                    const profileRes = await apiService.auth.getProfile();
                    if (profileRes.data.success) {
                        onSuccess({
                            ...pendingAuthData,
                            user: profileRes.data.data.user,
                        });
                    } else {
                        onSuccess(pendingAuthData);
                    }
                } catch {
                    onSuccess(pendingAuthData);
                }
                handleClose();
            };
            fetchAndComplete();
        } else {
            handleClose();
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
            setErrorMessage('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${baseURL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });

            const data = await response.json();

            if (data.success) {
                setViewMode('resetSent');
                setSuccessMessage('');
                setErrorMessage('');
            } else {
                setErrorMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setErrorMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = () => {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        localStorage.setItem('oauthInProgress', 'true');
        window.location.href = `${baseURL}/api/oauth/google`;
    };

    const handleClose = () => {
        setFormData({ email: '', password: '', username: '', firstName: '', lastName: '' });
        setForgotEmail('');
        setErrors({});
        setErrorMessage('');
        setSuccessMessage('');
        setShowPassword(false);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpEmail('');
        setPendingAuthData(null);
        setViewMode(mode === 'login' ? 'login' : 'signup');
        onClose();
    };

    const switchMode = () => {
        setViewMode(isLogin ? 'signup' : 'login');
        setErrors({});
        setErrorMessage('');
        setSuccessMessage('');
    };

    if (!isOpen) return null;

    // ─── OTP Verification View ───
    if (viewMode === 'otp') {
        const isFilled = otpDigits.every((d) => d !== '');
        return (
            <div className="auth-modal-overlay" onClick={handleClose}>
                <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                    <button className="auth-modal-close" onClick={handleClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <div className="auth-modal-content otp-content">
                        {/* Animated envelope icon */}
                        <div className="otp-icon-wrap">
                            <div className="otp-icon-bg">
                                <i className="fa-solid fa-envelope-open-text"></i>
                            </div>
                            <div className="otp-icon-ring"></div>
                        </div>

                        <h2 className="auth-modal-title">Verify Your Email</h2>
                        <p className="auth-modal-subtitle">
                            We sent a 6-digit code to<br />
                            <strong className="otp-email-highlight">{otpEmail}</strong>
                        </p>

                        {errorMessage && (
                            <div className="auth-alert auth-alert-error">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {errorMessage}
                            </div>
                        )}
                        {successMessage && (
                            <div className="auth-alert auth-alert-success">
                                <i className="fa-solid fa-circle-check"></i>
                                {successMessage}
                            </div>
                        )}

                        {/* OTP Input */}
                        <div className="otp-input-group" onPaste={handleOtpPaste}>
                            {otpDigits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (otpRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    className={`otp-digit ${digit ? 'filled' : ''}`}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    autoFocus={i === 0}
                                />
                            ))}
                        </div>

                        <button
                            className="auth-submit-btn otp-verify-btn"
                            onClick={handleVerifyOTP}
                            disabled={!isFilled || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-shield-check"></i>
                                    Verify & Continue
                                </>
                            )}
                        </button>

                        <div className="otp-resend">
                            <p>Didn't receive the code?</p>
                            {otpTimer > 0 ? (
                                <span className="otp-timer">
                                    Resend in <strong>{otpTimer}s</strong>
                                </span>
                            ) : (
                                <button
                                    className="otp-resend-btn"
                                    onClick={handleResendOTP}
                                    disabled={isLoading}
                                >
                                    Resend Code
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Congrats View (500 coins bonus) ───
    if (viewMode === 'congrats') {
        return (
            <div className="auth-modal-overlay" onClick={handleCongratsClose}>
                <div className="auth-modal-container congrats-container" onClick={(e) => e.stopPropagation()}>
                    <div className="auth-modal-content congrats-content">
                        {/* Animated particles background */}
                        <div className="congrats-particles">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="congrats-particle" style={{
                                    '--x': `${Math.random() * 100}%`,
                                    '--delay': `${Math.random() * 2}s`,
                                    '--size': `${4 + Math.random() * 6}px`,
                                    '--duration': `${2 + Math.random() * 3}s`,
                                }} />
                            ))}
                        </div>

                        {/* Trophy / Celebration Icon */}
                        <div className="congrats-icon-wrap">
                            <div className="congrats-glow"></div>
                            <div className="congrats-icon">
                                <span className="congrats-emoji">🎉</span>
                            </div>
                        </div>

                        <h2 className="congrats-title">Congratulations!</h2>
                        <p className="congrats-subtitle">Your email has been verified</p>

                        {/* Coin reward card */}
                        <div className="congrats-reward-card">
                            <div className="congrats-coin-anim">
                                <span className="congrats-coin-icon">🪙</span>
                                <span className="congrats-coin-icon delay-1">🪙</span>
                                <span className="congrats-coin-icon delay-2">🪙</span>
                            </div>
                            <div className="congrats-reward-amount">+{bonusCoins}</div>
                            <div className="congrats-reward-label">Welcome Coins</div>
                        </div>

                        <p className="congrats-message">
                            Unleash your creativity — generate stunning AI art, <br />
                            videos, and more with your free coins!
                        </p>

                        <button className="congrats-btn" onClick={handleCongratsClose}>
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            Start Creating
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Forgot Password View ───
    if (viewMode === 'forgot') {
        return (
            <div className="auth-modal-overlay" onClick={handleClose}>
                <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                    <button className="auth-modal-close" onClick={handleClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <div className="auth-modal-content">
                        <div className="auth-modal-logo">
                            <img src="/assets/Logo-leela-black.jpg" alt="Leelaah Logo" />
                        </div>
                        <h2 className="auth-modal-title">Reset Password</h2>
                        <p className="auth-modal-subtitle">
                            Enter your email and we'll send you a reset link
                        </p>

                        {errorMessage && (
                            <div className="auth-alert auth-alert-error">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {errorMessage}
                            </div>
                        )}

                        <form className="auth-modal-form" onSubmit={handleForgotPassword}>
                            <div className="form-group">
                                <label htmlFor="forgot-email">Email</label>
                                <input
                                    type="email"
                                    id="forgot-email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>

                        <div className="auth-switch">
                            <p>
                                Remember your password?
                                <button
                                    onClick={() => {
                                        setViewMode('login');
                                        setErrorMessage('');
                                    }}
                                    className="switch-btn"
                                >
                                    Back to Login
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Reset Link Sent Confirmation ───
    if (viewMode === 'resetSent') {
        return (
            <div className="auth-modal-overlay" onClick={handleClose}>
                <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                    <button className="auth-modal-close" onClick={handleClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <div className="auth-modal-content" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: 'rgba(74, 181, 142, 0.1)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px', fontSize: '28px', color: '#4ab58e'
                        }}>
                            <i className="fa-solid fa-envelope-circle-check"></i>
                        </div>
                        <h2 className="auth-modal-title">Check Your Email</h2>
                        <p className="auth-modal-subtitle" style={{ marginBottom: '12px' }}>
                            If an account exists for <strong style={{ color: '#fff' }}>{forgotEmail}</strong>,
                            you'll receive a password reset link shortly.
                        </p>
                        <p className="auth-modal-subtitle" style={{ fontSize: '12px', marginBottom: '28px' }}>
                            Didn't receive it? Check your spam folder or try again.
                        </p>
                        <button
                            className="auth-submit-btn"
                            onClick={() => {
                                setViewMode('login');
                                setForgotEmail('');
                                setErrorMessage('');
                            }}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Login / Signup View ───
    return (
        <div className="auth-modal-overlay" onClick={handleClose}>
            <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={handleClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="auth-modal-content">
                    {/* Logo */}
                    <div className="auth-modal-logo">
                        <img src="/assets/Logo-leela-black.jpg" alt="Leelaah Logo" />
                    </div>

                    {/* Title */}
                    <h2 className="auth-modal-title">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="auth-modal-subtitle">
                        {isLogin
                            ? 'Login to continue your creative journey'
                            : 'Join the creative community today'}
                    </p>

                    {/* Success/Error Messages */}
                    {successMessage && (
                        <div className="auth-alert auth-alert-success">
                            <i className="fa-solid fa-circle-check"></i>
                            {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="auth-alert auth-alert-error">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {errorMessage}
                        </div>
                    )}

                    {/* Form */}
                    <form className="auth-modal-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Enter your first name"
                                        className={errors.firstName ? 'error' : ''}
                                    />
                                    {errors.firstName && (
                                        <span className="error-text">{errors.firstName}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Enter your last name"
                                    />
                                </div>
                            </div>
                        )}

                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    className={errors.username ? 'error' : ''}
                                />
                                {errors.username && (
                                    <span className="error-text">{errors.username}</span>
                                )}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && (
                                <span className="error-text">{errors.email}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className={errors.password ? 'error' : ''}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                            {errors.password && (
                                <span className="error-text">{errors.password}</span>
                            )}
                        </div>

                        {isLogin && (
                            <div className="form-actions">
                                <label className="remember-me">
                                    <input type="checkbox" />
                                    <span>Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    className="forgot-password"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setViewMode('forgot');
                                        setErrorMessage('');
                                        setSuccessMessage('');
                                        setForgotEmail(formData.email || '');
                                    }}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    {isLogin ? 'Logging in...' : 'Creating account...'}
                                </>
                            ) : (
                                isLogin ? 'Login' : 'Sign Up'
                            )}
                        </button>
                    </form>

                    {/* OAuth Options */}
                    <div className="auth-divider">
                        <span>or continue with</span>
                    </div>

                    <div className="auth-oauth-buttons" style={{ gridTemplateColumns: '1fr' }}>
                        <button className="oauth-btn" onClick={handleGoogleAuth} type="button">
                            <i className="fa-brands fa-google"></i>
                            Google
                        </button>
                    </div>

                    {/* Switch Mode */}
                    <div className="auth-switch">
                        <p>
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={switchMode} className="switch-btn">
                                {isLogin ? 'Sign Up' : 'Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
