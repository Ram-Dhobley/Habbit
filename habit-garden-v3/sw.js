const CACHE = 'hg-v2';
const ASSETS = [
  '/', '/index.html', '/css/app.css',
  '/js/data.js', '/js/app.js',
  '/js/screens/home.js', '/js/screens/feed.js',
  '/js/screens/notifs-msgs-profile.js', '/js/screens/overlays.js'
];
self.addEventListener('install',  e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch',    e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
