const CACHE = 'habitgarden-v1';
const ASSETS = ['/', '/index.html', '/css/app.css', '/js/data.js', '/js/app.js', '/js/screens/home.js', '/js/screens/feed.js', '/js/screens/notifs.js', '/js/screens/messages.js', '/js/screens/profile.js', '/js/screens/add-habit.js', '/js/screens/complete.js', '/js/screens/plant-detail.js'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
