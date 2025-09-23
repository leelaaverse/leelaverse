// DOM Elements
const waitlistModal = document.getElementById('waitlistModal');
const waitlistButtons = [
    document.getElementById('navWaitlistBtn'),
    document.getElementById('mainWaitlistBtn'),
    document.getElementById('finalWaitlistBtn')
];
const modalClose = document.getElementById('modalClose');
const waitlistForm = document.getElementById('waitlistForm');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');

// FAQ Accordion Functionality
function initFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// Newsletter Subscription
function initNewsletterSubscription() {
    const newsletterForm = document.querySelector('.newsletter-form');
    const newsletterInput = document.querySelector('.newsletter-input');
    const newsletterButton = document.querySelector('.newsletter-button');

    if (newsletterButton && newsletterInput) {
        newsletterButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const email = newsletterInput.value.trim();

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            // Show loading state
            const originalText = newsletterButton.textContent;
            newsletterButton.textContent = 'Subscribing...';
            newsletterButton.disabled = true;

            try {
                // Simulate API call
                await simulateNewsletterSignup(email);
                showNotification('🎉 Successfully subscribed to newsletter!', 'success');
                newsletterInput.value = '';
            } catch (error) {
                showNotification('Failed to subscribe. Please try again.', 'error');
            } finally {
                newsletterButton.textContent = originalText;
                newsletterButton.disabled = false;
            }
        });

        // Also handle Enter key
        newsletterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                newsletterButton.click();
            }
        });
    }
}

// Simulate Newsletter Signup
async function simulateNewsletterSignup(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) {
                // Store in localStorage
                const newsletterData = JSON.parse(localStorage.getItem('newsletter') || '[]');
                newsletterData.push({
                    email,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('newsletter', JSON.stringify(newsletterData));
                resolve();
            } else {
                reject(new Error('Simulated network error'));
            }
        }, 1000);
    });
}

// Pricing Card Interactions
function initPricingInteractions() {
    const pricingButtons = document.querySelectorAll('.pricing-button');

    pricingButtons.forEach(button => {
        button.addEventListener('click', () => {
            // For now, just show a message. In real app, this would redirect to payment
            showNotification('🚀 Redirecting to payment... (Demo only)', 'info');
        });
    });
}

// Smooth reveal animations for sections
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.step, .pricing-card, .testimonial-card, .faq-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Add CSS for scroll animations
function addScrollAnimationStyles() {
    const styles = `
        .step, .pricing-card, .testimonial-card, .faq-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .step.animate-in, .pricing-card.animate-in, .testimonial-card.animate-in, .faq-item.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .step:nth-child(1) { transition-delay: 0.1s; }
        .step:nth-child(2) { transition-delay: 0.2s; }
        .step:nth-child(3) { transition-delay: 0.3s; }
        
        .pricing-card:nth-child(1) { transition-delay: 0.1s; }
        .pricing-card:nth-child(2) { transition-delay: 0.2s; }
        .pricing-card:nth-child(3) { transition-delay: 0.3s; }
    `;

    if (!document.querySelector('#scroll-animation-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'scroll-animation-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Mobile Menu Toggle
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        // Add mobile menu functionality if needed
        console.log('Mobile menu clicked');
    });
}

// Modal Functions
function openModal() {
    waitlistModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus trap
    const firstFocusable = waitlistModal.querySelector('input[type="email"]');
    if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
    }
}

function closeModal() {
    waitlistModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event Listeners
waitlistButtons.forEach(button => {
    if (button) {
        button.addEventListener('click', openModal);
    }
});

if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

// Close modal on overlay click
if (waitlistModal) {
    waitlistModal.addEventListener('click', (e) => {
        if (e.target === waitlistModal) {
            closeModal();
        }
    });
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && waitlistModal.classList.contains('active')) {
        closeModal();
    }
});

// Waitlist Form Submission
if (waitlistForm) {
    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(waitlistForm);
        const email = waitlistForm.querySelector('input[type="email"]').value;
        const submitButton = waitlistForm.querySelector('.form-submit');

        // Validate email
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Joining...';
        submitButton.disabled = true;

        try {
            // Simulate API call (replace with actual endpoint)
            await simulateWaitlistSignup(email);

            // Success
            showNotification('🎉 Welcome to the future! You\'re on the waitlist!', 'success');
            waitlistForm.reset();
            setTimeout(closeModal, 2000);

        } catch (error) {
            // Error
            showNotification('Something went wrong. Please try again.', 'error');
            console.error('Waitlist signup error:', error);
        } finally {
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Simulate Waitlist Signup (replace with actual API call)
async function simulateWaitlistSignup(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success/failure
            if (Math.random() > 0.1) { // 90% success rate
                // Store in localStorage for demo purposes
                const waitlistData = JSON.parse(localStorage.getItem('waitlist') || '[]');
                waitlistData.push({
                    email,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('waitlist', JSON.stringify(waitlistData));
                resolve();
            } else {
                reject(new Error('Simulated network error'));
            }
        }, 1500);
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
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
            border: 1px solid #e5e7eb;
            min-width: 300px;
            max-width: 400px;
            transform: translateX(400px);
            transition: transform 0.3s ease-out;
        }
        
        .notification-success {
            border-left: 4px solid #10b981;
        }
        
        .notification-error {
            border-left: 4px solid #ef4444;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
        }
        
        .notification-message {
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
            margin-left: 12px;
        }
        
        .notification-close:hover {
            color: #374151;
        }
        
        .notification.active {
            transform: translateX(0);
        }
        
        @media (max-width: 480px) {
            .notification {
                right: 10px;
                left: 10px;
                min-width: auto;
                max-width: none;
                transform: translateY(-100px);
            }
            
            .notification.active {
                transform: translateY(0);
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

    // Trigger animation
    setTimeout(() => notification.classList.add('active'), 10);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('active');
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('active');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header Scroll Effect
let lastScrollY = 0;
const header = document.querySelector('.header');

function updateHeaderOnScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.backdropFilter = 'blur(20px)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(20px)';
    }

    // Hide/show header on scroll
    if (scrollY > lastScrollY && scrollY > 500) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }

    lastScrollY = scrollY;
}

// Throttled scroll event
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateHeaderOnScroll();
            ticking = false;
        });
        ticking = true;
    }
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .floating-card, .stat');

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});

// Stats Counter Animation
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        if (element.textContent.includes('K')) {
            element.textContent = Math.floor(current / 1000) + 'K+';
        } else if (element.textContent.includes('∞')) {
            element.textContent = '∞';
        } else if (element.textContent.includes('%')) {
            element.textContent = (current / 100).toFixed(2) + '%';
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Trigger counter animation when stats come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            const text = statNumber.textContent;

            if (text.includes('10K+')) {
                animateCounter(statNumber, 10000);
            } else if (text.includes('0.05%')) {
                animateCounter(statNumber, 5);
            }

            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const stats = document.querySelectorAll('.stat');
    stats.forEach(stat => statsObserver.observe(stat));
});

// Performance Optimization
if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading support
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers without native lazy loading
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
    document.head.appendChild(script);
}

// Preload critical resources
function preloadCriticalResources() {
    const criticalResources = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = resource;
        document.head.appendChild(link);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    preloadCriticalResources();
    initFAQAccordion();
    initNewsletterSubscription();
    initPricingInteractions();
    addScrollAnimationStyles();
    initScrollAnimations();
    console.log('🚀 Leelaaverse enhanced landing page loaded!');
});

// Error Handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Analytics (placeholder - replace with actual analytics)
function trackEvent(eventName, properties = {}) {
    console.log('Event tracked:', eventName, properties);
    // Replace with actual analytics service (Google Analytics, Mixpanel, etc.)
}

// Track waitlist signups
waitlistButtons.forEach(button => {
    if (button) {
        button.addEventListener('click', () => {
            trackEvent('waitlist_button_clicked', {
                button_location: button.id
            });
        });
    }
});

// Track form submissions
if (waitlistForm) {
    waitlistForm.addEventListener('submit', () => {
        trackEvent('waitlist_form_submitted');
    });
}

// Service Worker Registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}