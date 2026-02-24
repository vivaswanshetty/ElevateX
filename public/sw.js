// ElevateX Service Worker — PWA Push Notifications + Offline Support
const CACHE_VERSION = 'elevatex-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ── Fetch (network-first, fallback to cache) ──────────────────────────────────
self.addEventListener('fetch', event => {
    // Only cache GET requests; skip API calls and cross-origin
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('/api/')) return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const clone = response.clone();
                caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', event => {
    let data = { title: 'ElevateX', body: 'You have a new notification', icon: '/vite.svg', url: '/' };

    try {
        if (event.data) {
            data = { ...data, ...event.data.json() };
        }
    } catch (e) {
        // fallback data already set
    }

    const options = {
        body: data.body,
        icon: data.icon || '/vite.svg',
        badge: '/vite.svg',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/' },
        actions: [
            { action: 'view', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ── Notification Click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
