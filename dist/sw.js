/* Attachement Pro — cache du programme uniquement, jamais des dossiers de chantier. */
const VERSION = 'a05a0ce81bf919bd';
const SCOPE = new URL(self.registration.scope);
const CACHE_PREFIX = `attachement-pro:${SCOPE.pathname}:`;
const CACHE_NAME = `${CACHE_PREFIX}${VERSION}`;
const FILES = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './js/app.js',
  './js/core.js',
  './js/db.js',
  './js/media.js',
  './js/exports.js',
  './js/references.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './vendor/docx.umd.js',
  './vendor/pdf-lib.min.js'
];
const URLS = FILES.map(path => new URL(path, SCOPE).href);
const ALLOWED = new Set(URLS);

self.addEventListener('install', event => {
  // Installation atomique : une ressource manquante conserve l’ancienne version.
  event.waitUntil((async () => {
    const alreadyPresent = (await caches.keys()).includes(CACHE_NAME);
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.addAll(URLS.map(url => new Request(url, { cache: 'reload', credentials: 'same-origin' })));
    } catch (error) {
      if (!alreadyPresent) await caches.delete(CACHE_NAME);
      throw error;
    }
    // La nouvelle version attend la validation de l’utilisateur dans l’application.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'GET_VERSION') {
    (event.ports?.[0] || event.source)?.postMessage({ type: 'VERSION', version: VERSION, cacheName: CACHE_NAME });
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const shell = await cache.match(new URL('./index.html', SCOPE).href);
      if (shell) return shell;
      return fetch(request);
    })());
    return;
  }

  // Le cache contient uniquement la liste fermée des ressources de cette version.
  url.hash = '';
  url.search = '';
  if (!ALLOWED.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(url.href)) || fetch(request);
  })());
});
