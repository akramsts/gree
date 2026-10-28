const CACHE_NAME = 'gree-core-cache-v1';
const CORE_ASSETS = [
    './index.html',
    './about.html',
    './history.html',
    './settings.html',
    './style.css',
    './pages.css',
    './script.js',
    './theme.js',
    './engines.js',
    './utils.js',
    './logos/duckduckgo.svg',
    './logos/startpage.svg',
    './logos/brave.svg',
    './logos/ecosia.svg',
    './logos/bing.svg',
    './logos/yahoo.svg',
    './logos/google.svg',
    './icon-192.png',
    './icon-512.png',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

function cacheResponse(request, response) {
    if (!response || response.status !== 200 || response.type !== 'basic') {
        return Promise.resolve();
    }
    const copy = response.clone();
    return caches.open(CACHE_NAME)
        .then((cache) => cache.put(request, copy))
        .catch(() => { });
}

function fetchAndCache(event) {
    return fetch(event.request).then((response) => {
        event.waitUntil(cacheResponse(event.request, response));
        return response;
    });
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    if (new URL(request.url).origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetchAndCache(event).catch(() =>
                caches.match(request, { ignoreSearch: true })
                    .then((cached) => cached || caches.match('./index.html'))
            )
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetchAndCache(event);
            if (!cached) return network;
            event.waitUntil(network.catch(() => { }));
            return cached;
        })
    );
});
