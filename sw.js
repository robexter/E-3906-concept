const CACHE_NAME = 'e3906-concept-v4-cic-refino-concept-v5-52-mobile-20261015';
const APP_SHELL = [
  './',
  './index.html',
  './retirada-e3906.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isNavigation = req.mode === 'navigate' || req.destination === 'document';
  if (isNavigation) {
    event.respondWith(
      fetch(req).then(response => {
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(req,copy)).catch(()=>{});
        return response;
      }).catch(async()=> (await caches.match(req)) || caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(cached => {
      const network=fetch(req).then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(req,copy)).catch(()=>{});
        }
        return response;
      }).catch(()=>cached);
      return cached || network;
    })
  );
});
