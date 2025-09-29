// Leelaaverse Service Worker
// Provides offline functionality, caching, and PWA capabilities

const CACHE_NAME = 'leelaaverse-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Resources to cache immediately
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/feed.html',
    '/explore.html',
    '/messages.html',
    '/marketplace.html',
    '/profile.html',
    '/notifications.html',
    '/settings.html',
    '/styles.css',
    '/mobile-utils.css',
    '/script.js',
    '/data.js',
    '/profile.js',
    '/feed.js',
    '/explore.js',
    '/messages.js',
    '/marketplace.js',
    '/notifications.js',
    '/settings.js',
    '/favicon.ico',
    '/logo.png',
    '/manifest.json',
    OFFLINE_URL
];

// Resources that should be cached on first visit
const CACHE_ON_DEMAND = [
    '/profile-styles.css',
    '/feed-styles.css',
    '/explore-styles.css',
    '/messages-styles.css',
    '/marketplace-styles.css',
    '/notifications-styles.css',
    '/settings-styles.css'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching core assets');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => {
                console.log('[ServiceWorker] Core assets cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Failed to cache core assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log('[ServiceWorker] Serving from cache:', event.request.url);
                    return response;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cache the new resource
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                console.log('[ServiceWorker] Caching new resource:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.log('[ServiceWorker] Network request failed:', event.request.url);
                        
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        
                        // Return a generic offline response for other requests
                        return new Response(
                            JSON.stringify({
                                error: 'Offline',
                                message: 'This content is not available offline'
                            }),
                            {
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Push notifications
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received:', event);
    
    const options = {
        body: 'You have new updates in Leelaaverse!',
        icon: '/logo.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Updates',
                icon: '/icons/action-view.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/action-close.png'
            }
        ]
    };

    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.title = data.title || 'Leelaaverse';
        options.data = { ...options.data, ...data };
    }

    event.waitUntil(
        self.registration.showNotification('Leelaaverse', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification click:', event);
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/explore.html')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.matchAll().then((clients) => {
                if (clients.length > 0) {
                    return clients[0].focus();
                } else {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

// Background sync function
async function doBackgroundSync() {
    try {
        // Sync offline actions stored in IndexedDB
        const offlineActions = await getOfflineActions();
        
        for (const action of offlineActions) {
            try {
                await processOfflineAction(action);
                await removeOfflineAction(action.id);
            } catch (error) {
                console.error('[ServiceWorker] Failed to sync action:', action, error);
            }
        }
    } catch (error) {
        console.error('[ServiceWorker] Background sync failed:', error);
    }
}

// Offline actions management
async function getOfflineActions() {
    return new Promise((resolve) => {
        // In a real implementation, this would read from IndexedDB
        // For now, return empty array
        resolve([]);
    });
}

async function processOfflineAction(action) {
    console.log('[ServiceWorker] Processing offline action:', action);
    
    switch (action.type) {
        case 'like_post':
            return fetch(`/api/posts/${action.postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: action.userId })
            });
        case 'create_post':
            return fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(action.data)
            });
        case 'send_message':
            return fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(action.data)
            });
        default:
            console.log('[ServiceWorker] Unknown action type:', action.type);
    }
}

async function removeOfflineAction(actionId) {
    // In a real implementation, this would remove from IndexedDB
    console.log('[ServiceWorker] Removing offline action:', actionId);
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('[ServiceWorker] Periodic sync:', event.tag);
    
    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

async function syncContent() {
    try {
        console.log('[ServiceWorker] Syncing content...');
        
        // Pre-cache popular content
        const response = await fetch('/api/trending');
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put('/api/trending', response);
        }
    } catch (error) {
        console.error('[ServiceWorker] Content sync failed:', error);
    }
}

// Share target handling
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    if (url.pathname === '/feed.html' && url.searchParams.has('title')) {
        // Handle shared content
        event.respondWith(handleSharedContent(event.request));
    }
});

async function handleSharedContent(request) {
    const url = new URL(request.url);
    const title = url.searchParams.get('title');
    const text = url.searchParams.get('text');
    const sharedUrl = url.searchParams.get('url');
    
    // Store shared content for the app to access
    const sharedData = { title, text, url: sharedUrl };
    
    // In a real implementation, store in IndexedDB
    console.log('[ServiceWorker] Handling shared content:', sharedData);
    
    // Return the feed page
    return caches.match('/feed.html');
}

console.log('[ServiceWorker] Loaded successfully');
