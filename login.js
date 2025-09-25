// Login Page JavaScript - Free Resource Implementation

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordToggle = document.getElementById('passwordToggle');
const rememberMeCheckbox = document.getElementById('rememberMe');
const loginBtn = document.getElementById('loginBtn');
const demoFillBtn = document.getElementById('demoFillBtn');
const forgotPasswordLink = document.getElementById('forgotPassword');
const forgotModal = document.getElementById('forgotModal');
const forgotModalClose = document.getElementById('forgotModalClose');
const forgotForm = document.getElementById('forgotForm');
const loadingOverlay = document.getElementById('loadingOverlay');

// Social login buttons
const googleLoginBtn = document.getElementById('googleLogin');
const githubLoginBtn = document.getElementById('githubLogin');

// Demo credentials
const DEMO_CREDENTIALS = {
    email: 'demo@leelaaverse.com',
    password: 'demo123'
};

// Mock user database (in real app, this would be server-side)
const MOCK_USERS = [
    {
        id: 1,
        email: 'demo@leelaaverse.com',
        password: 'demo123',
        name: 'Demo User',
        avatar: 'https://via.placeholder.com/32x32/6366f1/ffffff?text=D'
    },
    {
        id: 2,
        email: 'artist@leelaaverse.com',
        password: 'artist123',
        name: 'AI Artist',
        avatar: 'https://via.placeholder.com/32x32/8b5cf6/ffffff?text=A'
    },
    {
        id: 3,
        email: 'creator@leelaaverse.com',
        password: 'creator123',
        name: 'Creative Maker',
        avatar: 'https://via.placeholder.com/32x32/06b6d4/ffffff?text=C'
    }
];

// Session management
class SessionManager {
    static setSession(user, rememberMe = false) {
        const sessionData = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar
            },
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe
        };

        if (rememberMe) {
            localStorage.setItem('leelaverse_session', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('leelaverse_session', JSON.stringify(sessionData));
        }
    }

    static getSession() {
        const sessionData = localStorage.getItem('leelaverse_session') || 
                          sessionStorage.getItem('leelaverse_session');
        
        if (sessionData) {
            try {
                return JSON.parse(sessionData);
            } catch (e) {
                console.error('Error parsing session data:', e);
                return null;
            }
        }
        return null;
    }

    static clearSession() {
        localStorage.removeItem('leelaverse_session');
        sessionStorage.removeItem('leelaverse_session');
    }

    static isLoggedIn() {
        return this.getSession() !== null;
    }
}

// Form validation
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password.length >= 3; // Simplified for demo
    }

    static showError(input, message) {
        // Remove existing error
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error styling
        input.style.borderColor = '#ef4444';
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
    }

    static clearError(input) {
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        input.style.borderColor = '#e5e7eb';
    }

    static clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(error => error.remove());
        document.querySelectorAll('input').forEach(input => {
            input.style.borderColor = '#e5e7eb';
        });
    }
}

// Authentication service
class AuthService {
    static async login(email, password) {
        return new Promise((resolve, reject) => {
            // Simulate API call delay
            setTimeout(() => {
                const user = MOCK_USERS.find(u => 
                    u.email.toLowerCase() === email.toLowerCase() && 
                    u.password === password
                );

                if (user) {
                    resolve(user);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1500); // Simulate network delay
        });
    }

    static async socialLogin(provider) {
        return new Promise((resolve, reject) => {
            // Simulate social login
            setTimeout(() => {
                if (Math.random() > 0.2) { // 80% success rate
                    const socialUser = {
                        id: Date.now(),
                        email: `${provider}user@leelaaverse.com`,
                        name: `${provider} User`,
                        avatar: `https://via.placeholder.com/32x32/6366f1/ffffff?text=${provider[0].toUpperCase()}`
                    };
                    resolve(socialUser);
                } else {
                    reject(new Error(`${provider} login failed. Please try again.`));
                }
            }, 2000);
        });
    }

    static async resetPassword(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                    resolve();
                } else {
                    reject(new Error('Email not found'));
                }
            }, 1000);
        });
    }
}

// Notification system
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    const styles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            min-width: 300px;
            max-width: 400px;
            transform: translateX(400px);
            transition: transform 0.3s ease-out;
            animation: slideIn 0.3s ease-out forwards;
        }
        
        @keyframes slideIn {
            to {
                transform: translateX(0);
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
        }
        
        .notification-icon {
            font-size: 18px;
        }
        
        .notification-message {
            flex: 1;
            font-size: 14px;
            font-weight: 500;
            color: #1f2937;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #9ca3af;
            transition: color 0.2s;
            padding: 4px;
        }
        
        .notification-close:hover {
            color: #374151;
        }
        
        @media (max-width: 480px) {
            .notification {
                right: 10px;
                left: 10px;
                min-width: auto;
                max-width: none;
            }
        }
    `;

    // Add styles to head if not already added
    if (!document.querySelector('#notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Add to DOM
    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Loading state management
function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
    }
}

// Password toggle functionality
if (passwordToggle) {
    passwordToggle.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        // Update icon
        const icon = passwordToggle.querySelector('.password-icon');
        if (isPassword) {
            icon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L17.94 17.94z"/>
                <path d="M1 1l22 22"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19L9.9 4.24z"/>
            `;
        } else {
            icon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            `;
        }
    });
}

// Demo credentials fill
if (demoFillBtn) {
    demoFillBtn.addEventListener('click', () => {
        emailInput.value = DEMO_CREDENTIALS.email;
        passwordInput.value = DEMO_CREDENTIALS.password;
        FormValidator.clearAllErrors();
        showNotification('Demo credentials filled! Click "Sign in" to login.', 'info', 3000);
    });
}

// Main login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;

        // Clear previous errors
        FormValidator.clearAllErrors();

        // Validate inputs
        let hasErrors = false;

        if (!email) {
            FormValidator.showError(emailInput, 'Email is required');
            hasErrors = true;
        } else if (!FormValidator.validateEmail(email)) {
            FormValidator.showError(emailInput, 'Please enter a valid email address');
            hasErrors = true;
        }

        if (!password) {
            FormValidator.showError(passwordInput, 'Password is required');
            hasErrors = true;
        } else if (!FormValidator.validatePassword(password)) {
            FormValidator.showError(passwordInput, 'Password must be at least 3 characters');
            hasErrors = true;
        }

        if (hasErrors) return;

        // Show loading state
        showLoading();
        loginBtn.disabled = true;
        const originalText = loginBtn.querySelector('.button-text').textContent;
        loginBtn.querySelector('.button-text').textContent = 'Signing in...';

        try {
            // Attempt login
            const user = await AuthService.login(email, password);
            
            // Set session
            SessionManager.setSession(user, rememberMe);
            
            // Success notification
            showNotification(`Welcome back, ${user.name}! 🎉`, 'success', 2000);
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } catch (error) {
            hideLoading();
            showNotification(error.message, 'error');
            
            // Reset button
            loginBtn.disabled = false;
            loginBtn.querySelector('.button-text').textContent = originalText;
        }
    });
}

// Social login handlers
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        showLoading();
        try {
            const user = await AuthService.socialLogin('Google');
            SessionManager.setSession(user, false);
            showNotification(`Welcome ${user.name}! Signed in with Google 🎉`, 'success', 2000);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            hideLoading();
            showNotification(error.message, 'error');
        }
    });
}

if (githubLoginBtn) {
    githubLoginBtn.addEventListener('click', async () => {
        showLoading();
        try {
            const user = await AuthService.socialLogin('GitHub');
            SessionManager.setSession(user, false);
            showNotification(`Welcome ${user.name}! Signed in with GitHub 🎉`, 'success', 2000);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            hideLoading();
            showNotification(error.message, 'error');
        }
    });
}

// Forgot password modal
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (forgotModalClose) {
    forgotModalClose.addEventListener('click', () => {
        forgotModal.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Close modal on overlay click
if (forgotModal) {
    forgotModal.addEventListener('click', (e) => {
        if (e.target === forgotModal) {
            forgotModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Forgot password form
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = forgotForm.querySelector('input[type="email"]');
        const submitBtn = forgotForm.querySelector('.form-submit');
        const email = emailInput.value.trim();

        if (!FormValidator.validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            await AuthService.resetPassword(email);
            showNotification('Password reset link sent to your email! 📧', 'success');
            forgotModal.classList.remove('active');
            document.body.style.overflow = '';
            forgotForm.reset();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    if (SessionManager.isLoggedIn()) {
        const session = SessionManager.getSession();
        showNotification(`You're already logged in as ${session.user.name}`, 'info', 3000);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to close modal
    if (e.key === 'Escape' && forgotModal.classList.contains('active')) {
        forgotModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && loginForm) {
        loginForm.dispatchEvent(new Event('submit'));
    }
});

// Form input enhancements
emailInput?.addEventListener('input', () => {
    FormValidator.clearError(emailInput);
});

passwordInput?.addEventListener('input', () => {
    FormValidator.clearError(passwordInput);
});

// Auto-focus email field
if (emailInput && !SessionManager.isLoggedIn()) {
    emailInput.focus();
}

// Analytics tracking (placeholder - replace with actual analytics)
function trackEvent(eventName, properties = {}) {
    console.log('Event tracked:', eventName, properties);
    // Replace with actual analytics service (Google Analytics, Mixpanel, etc.)
}

// Track login attempts
loginForm?.addEventListener('submit', () => {
    trackEvent('login_attempted', {
        method: 'email',
        has_remember_me: rememberMeCheckbox.checked
    });
});

googleLoginBtn?.addEventListener('click', () => {
    trackEvent('login_attempted', { method: 'google' });
});

githubLoginBtn?.addEventListener('click', () => {
    trackEvent('login_attempted', { method: 'github' });
});

forgotPasswordLink?.addEventListener('click', () => {
    trackEvent('forgot_password_clicked');
});

demoFillBtn?.addEventListener('click', () => {
    trackEvent('demo_credentials_used');
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    showNotification('Something went wrong. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('Connection error. Please check your internet.', 'error');
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SessionManager,
        FormValidator,
        AuthService
    };
}

console.log('🔐 Leelaaverse Login System Initialized');
