// Dashboard JavaScript - Interactive Features

// Session management (shared with login.js)
class SessionManager {
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

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const userProfileDropdown = document.getElementById('userProfileDropdown');
const profileDropdown = document.getElementById('profileDropdown');
const createModal = document.getElementById('createModal');
const createModalClose = document.getElementById('createModalClose');
const createBtns = document.querySelectorAll('.create-btn');

// Authentication check
function checkAuth() {
    if (!SessionManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize user interface
function initializeUserInterface() {
    const session = SessionManager.getSession();
    if (!session) return;

    // Update user info in header
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');
    
    if (userAvatar) userAvatar.src = session.user.avatar;
    if (userName) userName.textContent = session.user.name;

    // Update welcome message
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
        welcomeTitle.innerHTML = `Welcome back, <span class="gradient-text">${session.user.name}</span>!`;
    }
}

// Logout functionality
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        SessionManager.clearSession();
        showNotification('Logged out successfully! 👋', 'info', 2000);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Dropdown menu functionality
function initializeDropdowns() {
    const userProfile = document.getElementById('userProfileDropdown');
    const dropdown = document.getElementById('profileDropdown');
    
    if (userProfile && dropdown) {
        let isOpen = false;
        
        userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            isOpen = !isOpen;
            
            if (isOpen) {
                dropdown.style.opacity = '1';
                dropdown.style.visibility = 'visible';
                dropdown.style.transform = 'translateY(0)';
            } else {
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
                dropdown.style.transform = 'translateY(-10px)';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (isOpen) {
                isOpen = false;
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
                dropdown.style.transform = 'translateY(-10px)';
            }
        });

        // Prevent dropdown from closing when clicking inside
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// Create post modal functionality
function initializeCreateModal() {
    const createBtns = document.querySelectorAll('.create-btn');
    const createModal = document.getElementById('createModal');
    const createModalClose = document.getElementById('createModalClose');
    
    if (createBtns.length && createModal) {
        createBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                createModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        if (createModalClose) {
            createModalClose.addEventListener('click', () => {
                createModal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close modal on overlay click
        createModal.addEventListener('click', (e) => {
            if (e.target === createModal) {
                createModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked tab
            btn.classList.add('active');
            document.getElementById(targetTab + 'Tab').classList.add('active');
        });
    });

    // Style selection functionality
    const styleBtns = document.querySelectorAll('.style-btn');
    styleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            styleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Generate button functionality
    const generateBtn = document.querySelector('.generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const prompt = document.querySelector('.form-textarea').value.trim();
            const model = document.querySelector('.form-select').value;
            const style = document.querySelector('.style-btn.active')?.textContent || 'Realistic';
            
            if (!prompt) {
                showNotification('Please enter a prompt for your AI art', 'warning');
                return;
            }

            // Show loading state
            const originalText = generateBtn.textContent;
            generateBtn.textContent = 'Generating...';
            generateBtn.disabled = true;

            try {
                // Simulate AI generation
                await simulateAIGeneration(prompt, model, style);
                showNotification('AI art generated successfully! 🎨', 'success');
                createModal.classList.remove('active');
                document.body.style.overflow = '';
                
                // Reset form
                document.querySelector('.form-textarea').value = '';
                styleBtns.forEach(b => b.classList.remove('active'));
                styleBtns[0]?.classList.add('active');
                
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                generateBtn.textContent = originalText;
                generateBtn.disabled = false;
            }
        });
    }

    // Upload functionality
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = uploadArea?.querySelector('input[type="file"]');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.background = 'rgba(99, 102, 241, 0.05)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--gray-300)';
            uploadArea.style.background = 'transparent';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length) {
                handleFileUpload(files[0]);
            }
            uploadArea.style.borderColor = 'var(--gray-300)';
            uploadArea.style.background = 'transparent';
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }
}

// Simulate AI generation
async function simulateAIGeneration(prompt, model, style) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) { // 90% success rate
                // Deduct coins
                const coinsDisplay = document.querySelector('.coin-count');
                if (coinsDisplay) {
                    const currentCoins = parseInt(coinsDisplay.textContent.replace(',', ''));
                    coinsDisplay.textContent = (currentCoins - 50).toLocaleString();
                }
                resolve();
            } else {
                reject(new Error('AI generation failed. Please try again.'));
            }
        }, 3000); // Simulate generation time
    });
}

// Handle file upload
function handleFileUpload(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'warning');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('File size must be less than 5MB', 'warning');
        return;
    }

    showNotification('File uploaded successfully! 📁', 'success');
    createModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query.length > 2) {
                    performSearch(query);
                }
            }, 500);
        });

        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    performSearch(query);
                }
            }
        });
    }
}

// Perform search
function performSearch(query) {
    showNotification(`Searching for "${query}"... 🔍`, 'info', 2000);
    
    // Simulate search results
    setTimeout(() => {
        showNotification(`Found ${Math.floor(Math.random() * 100) + 1} results for "${query}"`, 'success');
    }, 1000);
}

// Add coins functionality
function initializeCoinsSystem() {
    const addCoinsBtn = document.querySelector('.add-coins-btn');
    
    if (addCoinsBtn) {
        addCoinsBtn.addEventListener('click', () => {
            showCoinsPurchaseModal();
        });
    }
}

// Show coins purchase modal
function showCoinsPurchaseModal() {
    const modalHtml = `
        <div class="modal-overlay active" id="coinsModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Buy Coins</h3>
                    <button class="modal-close" id="coinsModalClose">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">
                        Purchase coins to generate AI art and unlock premium features
                    </p>
                    <div style="display: grid; gap: 1rem;">
                        <div class="coin-package" data-coins="500" data-price="99">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 2px solid var(--gray-200); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.3s;">
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary);">500 Coins</div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">~10 generations</div>
                                </div>
                                <div style="font-weight: 700; color: var(--primary-color);">₹99</div>
                            </div>
                        </div>
                        <div class="coin-package" data-coins="1200" data-price="199">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 2px solid var(--primary-color); border-radius: var(--radius-lg); cursor: pointer; background: rgba(99, 102, 241, 0.05); position: relative;">
                                <div style="position: absolute; top: -8px; right: 8px; background: var(--primary-color); color: white; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px;">Popular</div>
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary);">1,200 Coins</div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">~24 generations</div>
                                </div>
                                <div style="font-weight: 700; color: var(--primary-color);">₹199</div>
                            </div>
                        </div>
                        <div class="coin-package" data-coins="2500" data-price="349">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 2px solid var(--gray-200); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.3s;">
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary);">2,500 Coins</div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">~50 generations</div>
                                </div>
                                <div style="font-weight: 700; color: var(--primary-color);">₹349</div>
                            </div>
                        </div>
                    </div>
                    <button id="purchaseCoinsBtn" style="width: 100%; margin-top: 1.5rem; padding: 1rem; background: var(--primary-gradient); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; opacity: 0.5;" disabled>
                        Select a package to continue
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';

    const coinsModal = document.getElementById('coinsModal');
    const coinsModalClose = document.getElementById('coinsModalClose');
    const purchaseBtn = document.getElementById('purchaseCoinsBtn');
    const packages = document.querySelectorAll('.coin-package');

    let selectedPackage = null;

    packages.forEach(pkg => {
        pkg.addEventListener('click', () => {
            packages.forEach(p => p.querySelector('div').style.borderColor = 'var(--gray-200)');
            pkg.querySelector('div').style.borderColor = 'var(--primary-color)';
            
            selectedPackage = {
                coins: pkg.dataset.coins,
                price: pkg.dataset.price
            };

            purchaseBtn.style.opacity = '1';
            purchaseBtn.disabled = false;
            purchaseBtn.textContent = `Purchase ${selectedPackage.coins} Coins for ₹${selectedPackage.price}`;
        });
    });

    purchaseBtn.addEventListener('click', () => {
        if (selectedPackage) {
            simulateCoinsPurchase(selectedPackage);
        }
    });

    coinsModalClose.addEventListener('click', () => {
        coinsModal.remove();
        document.body.style.overflow = '';
    });

    coinsModal.addEventListener('click', (e) => {
        if (e.target === coinsModal) {
            coinsModal.remove();
            document.body.style.overflow = '';
        }
    });
}

// Simulate coins purchase
function simulateCoinsPurchase(package) {
    const purchaseBtn = document.getElementById('purchaseCoinsBtn');
    const originalText = purchaseBtn.textContent;
    
    purchaseBtn.textContent = 'Processing payment...';
    purchaseBtn.disabled = true;

    setTimeout(() => {
        // Update coins display
        const coinsDisplay = document.querySelector('.coin-count');
        if (coinsDisplay) {
            const currentCoins = parseInt(coinsDisplay.textContent.replace(',', ''));
            const newCoins = currentCoins + parseInt(package.coins);
            coinsDisplay.textContent = newCoins.toLocaleString();
        }

        showNotification(`Successfully purchased ${package.coins} coins! 💰`, 'success');
        document.getElementById('coinsModal').remove();
        document.body.style.overflow = '';
    }, 2000);
}

// Interactive post cards
function initializePostCards() {
    const postCards = document.querySelectorAll('.post-card');
    
    postCards.forEach(card => {
        const viewBtn = card.querySelector('.post-action');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showPostDetails(card);
            });
        }
    });
}

// Show post details
function showPostDetails(postCard) {
    const title = postCard.querySelector('.post-title').textContent;
    const img = postCard.querySelector('img').src;
    
    showNotification(`Viewing: ${title}`, 'info');
    
    // In a real app, this would open a detailed post view
    console.log('Opening post details for:', title);
}

// Filter functionality
function initializeFilters() {
    const filterSelect = document.querySelector('.filter-select');
    
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const filter = e.target.value;
            showNotification(`Filtering by: ${filter}`, 'info', 2000);
            
            // Simulate filtering
            setTimeout(() => {
                showNotification('Filter applied successfully!', 'success', 2000);
            }, 1000);
        });
    }
}

// Notification system (shared)
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

    // Add styles (same as login.js)
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

// Initialize all dashboard functionality
function initializeDashboard() {
    if (!checkAuth()) return;

    initializeUserInterface();
    initializeDropdowns();
    initializeCreateModal();
    initializeSearch();
    initializeCoinsSystem();
    initializePostCards();
    initializeFilters();
    
    // Add logout event listener
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Mobile responsiveness
function initializeMobileFeatures() {
    // Mobile menu toggle (if needed)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Close sidebar on mobile when clicking outside
    if (window.innerWidth <= 1024) {
        document.addEventListener('click', (e) => {
            if (sidebar && !sidebar.contains(e.target) && !e.target.closest('.mobile-menu-btn')) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }
}

// Keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) searchInput.focus();
        }
        
        // Ctrl/Cmd + N to create new post
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const createBtn = document.querySelector('.create-btn');
            if (createBtn) createBtn.click();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// Analytics tracking
function trackEvent(eventName, properties = {}) {
    console.log('Event tracked:', eventName, properties);
    // Replace with actual analytics service
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    showNotification('Something went wrong. Please refresh the page.', 'error');
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    initializeMobileFeatures();
    initializeKeyboardShortcuts();
    
    // Welcome message for new users
    const session = SessionManager.getSession();
    if (session) {
        const loginTime = new Date(session.loginTime);
        const timeSinceLogin = Date.now() - loginTime.getTime();
        
        // Show welcome message if logged in within last 5 minutes
        if (timeSinceLogin < 5 * 60 * 1000) {
            setTimeout(() => {
                showNotification(`Welcome to your dashboard, ${session.user.name}! 🎉`, 'success', 4000);
            }, 1000);
        }
    }
});

console.log('📊 Leelaaverse Dashboard Initialized');
