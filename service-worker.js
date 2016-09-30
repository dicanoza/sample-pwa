var cacheName = 'weatherPWA-step-6-1-http://127.0.0.1:8887';
var dataCacheName = 'weatherData-v1';
var filesToCache = [
    '/sample-pwa/',
    '/sample-pwa/index.html',
    '/sample-pwa/scripts/app.js',
    '/sample-pwa//styles/inline.css',
    '/sample-pwa/images/clear.png',
    '/sample-pwa/images/cloudy-scattered-showers.png',
    '/sample-pwa/images/cloudy.png',
    '/sample-pwa/images/fog.png',
    '/sample-pwa/images/ic_add_white_24px.svg',
    '/sample-pwa/images/ic_refresh_white_24px.svg',
    '/sample-pwa/images/partly-cloudy.png',
    '/sample-pwa/images/rain.png',
    '/sample-pwa/images/scattered-showers.png',
    '/sample-pwa/images/sleet.png',
    '/sample-pwa/images/snow.png',
    '/sample-pwa/images/thunderstorm.png',
    '/sample-pwa/images/wind.png'
];


self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});
self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    console.log('[Service Worker] Fetch', e.request.url);
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    if (e.request.url.indexOf(dataUrl) > -1) {
        e.respondWith(
            caches.open(dataCacheName).then(function(cache) {
                return fetch(e.request).then(function(response) {
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(function(response) {
                return response || fetch(e.request);
            })
        );
    }
});
