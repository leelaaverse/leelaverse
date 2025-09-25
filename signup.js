// Signup Page JavaScript - Complete Registration System

// Import session manager (same as login.js)
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

    static isLoggedIn() {
        return this.getSession() !== null;
    }
}

// DOM Elements
const signupForm = document.getElementById('signupForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordToggle = document.getElementById('passwordToggle');
const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
const agreeTermsCheckbox = document.getElementById('agreeTerms');
const newsletterCheckbox = document.getElementById('newsletter');
const signupBtn = document.getElementById('signupBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Password strength elements
const passwordStrengthContainer = document.getElementById('passwordStrength');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');

// Social signup buttons
const googleSignupBtn = document.getElementById('googleSignup');
const githubSignupBtn = document.getElementById('githubSignup');

// Mock user database (simulate existing users)
const EXISTING_USERS = [
    'demo@leelaaverse.com',
    'admin@leelaaverse.com',
    'test@example.com'
];

const EXISTING_USERNAMES = [
    'demo',
    'admin',
    'test',
    'leelaaverse',
    'ai_artist',
    'creator'
];

// Form validation class
class FormValidator {
    static validateName(name) {
        return name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(name.trim());
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }

    static validatePassword(password) {
        return {
            isValid: password.length >= 8,
            strength: this.calculatePasswordStrength(password)
        };
    }

    static calculatePasswordStrength(password) {
        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength += 1;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) strength += 1;
        else feedback.push('Lowercase letter');

        if (/[A-Z]/.test(password)) strength += 1;
        else feedback.push('Uppercase letter');

        if (/[0-9]/.test(password)) strength += 1;
        else feedback.push('Number');

        if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
        else feedback.push('Special character');

        const levels = ['very-weak', 'weak', 'fair', 'good', 'strong'];
        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

        return {
            score: strength,
            level: levels[Math.min(strength, 4)],
            label: labels[Math.min(strength, 4)],
            feedback: feedback
        };
    }

    static showError(input, message) {
        this.clearError(input);

        input.style.borderColor = '#ef4444';
        
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

// Registration service
class RegistrationService {
    static async registerUser(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check for existing email
                if (EXISTING_USERS.includes(userData.email.toLowerCase())) {
                    reject(new Error('An account with this email already exists'));
                    return;
                }

                // Check for existing username
                if (EXISTING_USERNAMES.includes(userData.username.toLowerCase())) {
                    reject(new Error('This username is already taken'));
                    return;
                }

                // Simulate registration success
                if (Math.random() > 0.05) { // 95% success rate
                    const newUser = {
                        id: Date.now(),
                        email: userData.email,
                        name: `${userData.firstName} ${userData.lastName}`,
                        username: userData.username,
                        avatar: `https://via.placeholder.com/32x32/6366f1/ffffff?text=${userData.firstName[0]}${userData.lastName[0]}`,
                        createdAt: new Date().toISOString(),
                        coins: 100 // Welcome bonus
                    };

                    // Add to "database"
                    EXISTING_USERS.push(userData.email.toLowerCase());
                    EXISTING_USERNAMES.push(userData.username.toLowerCase());

                    resolve(newUser);
                } else {
                    reject(new Error('Registration failed. Please try again.'));
                }
            }, 2000); // Simulate network delay
        });
    }

    static async socialRegister(provider, userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate
                    const socialUser = {
                        id: Date.now(),
                        email: userData.email || `${provider.toLowerCase()}${Date.now()}@leelaaverse.com`,
                        name: userData.name || `${provider} User`,
                        username: userData.username || `${provider.toLowerCase()}_user_${Date.now()}`,
                        avatar: userData.avatar || `https://via.placeholder.com/32x32/6366f1/ffffff?text=${provider[0]}`,
                        provider: provider.toLowerCase(),
                        coins: 100
                    };
                    resolve(socialUser);
                } else {
                    reject(new Error(`${provider} registration failed. Please try again.`));
                }
            }, 2000);
        });
    }

    static async checkEmailAvailability(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(!EXISTING_USERS.includes(email.toLowerCase()));
            }, 500);
        });
    }

    static async checkUsernameAvailability(username) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(!EXISTING_USERNAMES.includes(username.toLowerCase()));
            }, 500);
        });
    }
}

// Password toggle functionality
function initializePasswordToggles() {
    [passwordToggle, confirmPasswordToggle].forEach((toggle, index) => {
        if (!toggle) return;
        
        const input = index === 0 ? passwordInput : confirmPasswordInput;
        
        toggle.addEventListener('click', () => {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            
            const icon = toggle.querySelector('.password-icon');
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
    });
}

// Password strength indicator
function updatePasswordStrength(password) {
    const strength = FormValidator.calculatePasswordStrength(password);
    
    // Remove existing strength classes
    passwordStrengthContainer.className = 'password-strength';
    
    if (password.length === 0) {
        strengthText.textContent = 'Enter a password';
        strengthFill.style.width = '0%';
        return;
    }
    
    // Add strength class
    passwordStrengthContainer.classList.add(`strength-${strength.level}`);
    
    // Update text and progress
    strengthText.textContent = `${strength.label}${strength.feedback.length ? ` - Add: ${strength.feedback.join(', ')}` : ''}`;
    
    const widthPercentage = (strength.score / 5) * 100;
    strengthFill.style.width = `${widthPercentage}%`;
}

// Real-time validation
function initializeRealTimeValidation() {
    let emailTimeout, usernameTimeout;

    // Name validation
    [firstNameInput, lastNameInput].forEach(input => {
        input.addEventListener('blur', () => {
            const value = input.value.trim();
            if (value && !FormValidator.validateName(value)) {
                FormValidator.showError(input, 'Please enter a valid name (letters only)');
            } else {
                FormValidator.clearError(input);
            }
        });
        
        input.addEventListener('input', () => {
            FormValidator.clearError(input);
        });
    });

    // Email validation
    emailInput.addEventListener('input', () => {
        FormValidator.clearError(emailInput);
        clearTimeout(emailTimeout);
        
        const email = emailInput.value.trim();
        if (email && FormValidator.validateEmail(email)) {
            emailTimeout = setTimeout(async () => {
                const isAvailable = await RegistrationService.checkEmailAvailability(email);
                if (!isAvailable) {
                    FormValidator.showError(emailInput, 'This email is already registered');
                }
            }, 1000);
        }
    });

    emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        if (email && !FormValidator.validateEmail(email)) {
            FormValidator.showError(emailInput, 'Please enter a valid email address');
        }
    });

    // Username validation
    usernameInput.addEventListener('input', () => {
        FormValidator.clearError(usernameInput);
        clearTimeout(usernameTimeout);
        
        const username = usernameInput.value.trim();
        if (username && FormValidator.validateUsername(username)) {
            usernameTimeout = setTimeout(async () => {
                const isAvailable = await RegistrationService.checkUsernameAvailability(username);
                if (!isAvailable) {
                    FormValidator.showError(usernameInput, 'This username is already taken');
                }
            }, 1000);
        }
    });

    usernameInput.addEventListener('blur', () => {
        const username = usernameInput.value.trim();
        if (username && !FormValidator.validateUsername(username)) {
            FormValidator.showError(usernameInput, 'Username must be 3-20 characters (letters, numbers, underscore only)');
        }
    });

    // Password validation
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        updatePasswordStrength(password);
        FormValidator.clearError(passwordInput);
        
        // Recheck confirm password if it has a value
        if (confirmPasswordInput.value) {
            validatePasswordMatch();
        }
    });

    // Confirm password validation
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
}

function validatePasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword && password !== confirmPassword) {
        FormValidator.showError(confirmPasswordInput, 'Passwords do not match');
    } else {
        FormValidator.clearError(confirmPasswordInput);
    }
}

// Form submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear all previous errors
        FormValidator.clearAllErrors();
        
        // Collect form data
        const formData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            username: usernameInput.value.trim(),
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value,
            agreeTerms: agreeTermsCheckbox.checked,
            newsletter: newsletterCheckbox.checked
        };

        // Validate all fields
        let hasErrors = false;

        // Name validation
        if (!formData.firstName) {
            FormValidator.showError(firstNameInput, 'First name is required');
            hasErrors = true;
        } else if (!FormValidator.validateName(formData.firstName)) {
            FormValidator.showError(firstNameInput, 'Please enter a valid first name');
            hasErrors = true;
        }

        if (!formData.lastName) {
            FormValidator.showError(lastNameInput, 'Last name is required');
            hasErrors = true;
        } else if (!FormValidator.validateName(formData.lastName)) {
            FormValidator.showError(lastNameInput, 'Please enter a valid last name');
            hasErrors = true;
        }

        // Email validation
        if (!formData.email) {
            FormValidator.showError(emailInput, 'Email is required');
            hasErrors = true;
        } else if (!FormValidator.validateEmail(formData.email)) {
            FormValidator.showError(emailInput, 'Please enter a valid email address');
            hasErrors = true;
        }

        // Username validation
        if (!formData.username) {
            FormValidator.showError(usernameInput, 'Username is required');
            hasErrors = true;
        } else if (!FormValidator.validateUsername(formData.username)) {
            FormValidator.showError(usernameInput, 'Username must be 3-20 characters (letters, numbers, underscore only)');
            hasErrors = true;
        }

        // Password validation
        const passwordValidation = FormValidator.validatePassword(formData.password);
        if (!formData.password) {
            FormValidator.showError(passwordInput, 'Password is required');
            hasErrors = true;
        } else if (!passwordValidation.isValid) {
            FormValidator.showError(passwordInput, 'Password must be at least 8 characters');
            hasErrors = true;
        } else if (passwordValidation.strength.score < 2) {
            FormValidator.showError(passwordInput, 'Please choose a stronger password');
            hasErrors = true;
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            FormValidator.showError(confirmPasswordInput, 'Please confirm your password');
            hasErrors = true;
        } else if (formData.password !== formData.confirmPassword) {
            FormValidator.showError(confirmPasswordInput, 'Passwords do not match');
            hasErrors = true;
        }

        // Terms agreement validation
        if (!formData.agreeTerms) {
            showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
            hasErrors = true;
        }

        if (hasErrors) return;

        // Show loading state
        showLoading();
        signupBtn.disabled = true;
        const originalText = signupBtn.querySelector('.button-text').textContent;
        signupBtn.querySelector('.button-text').textContent = 'Creating Account...';

        try {
            // Attempt registration
            const newUser = await RegistrationService.registerUser(formData);
            
            // Set session (auto-login)
            SessionManager.setSession(newUser, false);
            
            // Success notification
            showNotification(`Welcome to Leelaaverse, ${newUser.name}! 🎉 You've received 100 free coins!`, 'success', 3000);
            
            // Track registration
            trackEvent('user_registered', {
                method: 'email',
                newsletter_opted: formData.newsletter
            });
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);

        } catch (error) {
            hideLoading();
            showNotification(error.message, 'error');
            
            // Reset button
            signupBtn.disabled = false;
            signupBtn.querySelector('.button-text').textContent = originalText;
        }
    });
}

// Social registration handlers
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', async () => {
        showLoading();
        try {
            const userData = {
                name: 'Google User',
                email: 'googleuser@example.com'
            };
            const user = await RegistrationService.socialRegister('Google', userData);
            SessionManager.setSession(user, false);
            showNotification(`Welcome to Leelaaverse! Signed up with Google 🎉`, 'success', 2000);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            hideLoading();
            showNotification(error.message, 'error');
        }
    });
}

if (githubSignupBtn) {
    githubSignupBtn.addEventListener('click', async () => {
        showLoading();
        try {
            const userData = {
                name: 'GitHub User',
                email: 'githubuser@example.com'
            };
            const user = await RegistrationService.socialRegister('GitHub', userData);
            SessionManager.setSession(user, false);
            showNotification(`Welcome to Leelaaverse! Signed up with GitHub 🎉`, 'success', 2000);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            hideLoading();
            showNotification(error.message, 'error');
        }
    });
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

// Notification system (same as login.js)
function showNotification(message, type = 'info', duration = 5000) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

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

    if (!document.querySelector('#notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = `
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
                to { transform: translateX(0); }
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
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
        `;
        document.head.appendChild(styleSheet);
    }

    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Analytics tracking
function trackEvent(eventName, properties = {}) {
    console.log('Event tracked:', eventName, properties);
}

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    if (SessionManager.isLoggedIn()) {
        const session = SessionManager.getSession();
        showNotification(`You're already logged in as ${session.user.name}`, 'info', 3000);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return;
    }

    // Initialize all functionality
    initializePasswordToggles();
    initializeRealTimeValidation();
    
    // Focus first name field
    if (firstNameInput) {
        firstNameInput.focus();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && signupForm) {
        signupForm.dispatchEvent(new Event('submit'));
    }
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

console.log('📝 Leelaaverse Signup System Initialized');
