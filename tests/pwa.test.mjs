import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const workerCode = fs.readFileSync(path.join(dist, 'sw.js'), 'utf8');

function workerHarness({ scope = 'https://example.github.io/attachement-pro/' } = {}) {
  const events = new Map();
  const cacheMap = new Map();
  const state = { claimed: false, skipped: false, failAdds: false, networkRequests: 0 };
  const context = {
    URL, Request, Promise, Set,
    self: {
      registration: { scope },
      clients: { claim: async () => { state.claimed = true; } },
      skipWaiting: () => { state.skipped = true; },
      addEventListener: (name, fn) => events.set(name, fn)
    },
    caches: {
      open: async name => {
        if (!cacheMap.has(name)) cacheMap.set(name, new Map());
        const items = cacheMap.get(name);
        return {
          addAll: async requests => {
            if (state.failAdds) throw new Error('Ressource absente');
            // Cache.addAll est atomique : le simulacre écrit après la vérification.
            for (const request of requests) items.set(request.url, `CACHED ${request.url}`);
          },
          match: async url => items.get(url)
        };
      },
      keys: async () => [...cacheMap.keys()],
      delete: async name => cacheMap.delete(name)
    },
    fetch: async () => { state.networkRequests++; return 'NETWORK'; }
  };
  vm.createContext(context);
  vm.runInContext(workerCode, context);
  return {
    state, cacheMap, events,
    async lifecycle(name) {
      let promise;
      events.get(name)({ waitUntil: value => { promise = value; } });
      await promise;
    },
    async fetch(url, options = {}) {
      let promise;
      events.get('fetch')({
        request: { url, method: options.method || 'GET', mode: options.mode || 'cors' },
        respondWith: value => { promise = value; }
      });
      return promise ? await promise : undefined;
    }
  };
}

test('Le manifeste reste installable sous un sous-répertoire GitHub Pages', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'), 'utf8'));
  assert.ok(manifest.name || manifest.short_name);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.id, './');
  assert.ok(manifest.icons.some(i => i.sizes === '192x192' && i.purpose === 'any'));
  assert.ok(manifest.icons.some(i => i.sizes === '512x512' && i.purpose === 'any'));
  assert.ok(manifest.icons.some(i => i.purpose === 'maskable'));
  for (const icon of manifest.icons) {
    assert.ok(icon.src.startsWith('./'));
    const bytes = fs.readFileSync(path.join(dist, icon.src));
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`, icon.sizes);
  }
});

test('Toutes les ressources du précache existent, sans CDN ni chemin absolu', async () => {
  const h = workerHarness();
  await h.lifecycle('install');
  assert.equal(h.state.skipped, false, 'pas d’activation forcée pendant une saisie');
  const [cacheName, contents] = [...h.cacheMap.entries()][0];
  assert.ok(cacheName.startsWith('attachement-pro:/attachement-pro/:'));
  for (const url of contents.keys()) {
    const prefix = 'https://example.github.io/attachement-pro/';
    assert.ok(url.startsWith(prefix), `Ressource externe : ${url}`);
    const local = path.join(dist, url.slice(prefix.length) || 'index.html');
    assert.ok(fs.statSync(local).isFile(), `Ressource manquante : ${local}`);
  }
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  assert.ok(/rel=["']manifest["']/.test(html));
  assert.ok(!/<(?:script|link)[^>]+(?:src|href)=["']https?:/i.test(html), 'Le programme doit charger ses ressources locales.');
});

test('Le cache sert le programme hors ligne et ignore requêtes privées et externes', async () => {
  const h = workerHarness();
  await h.lifecycle('install');
  assert.ok((await h.fetch('https://example.github.io/attachement-pro/?route=editor', { mode: 'navigate' })).endsWith('/index.html'));
  assert.ok((await h.fetch('https://example.github.io/attachement-pro/js/app.js?v=1')).endsWith('/js/app.js'));
  assert.equal(h.state.networkRequests, 0);
  assert.equal(await h.fetch('https://third-party.example/track'), undefined);
  assert.equal(await h.fetch('https://example.github.io/attachement-pro/backup.json'), undefined);
  assert.equal(await h.fetch('https://example.github.io/autre-projet/index.html'), undefined);
  assert.equal(await h.fetch('https://example.github.io/attachement-pro/index.html', { method: 'POST' }), undefined);
});

test('Une mise à jour attend une action et nettoie seulement les anciennes versions de son scope', async () => {
  const h = workerHarness();
  await h.lifecycle('install');
  const current = [...h.cacheMap.keys()][0];
  h.cacheMap.set('attachement-pro:/autre-projet/:v1', new Map());
  h.cacheMap.set('attachement-pro:/attachement-pro/:ancienne', new Map());
  h.cacheMap.set('autre-application', new Map());
  h.events.get('message')({ data: { type: 'UNRELATED' } });
  assert.equal(h.state.skipped, false);
  h.events.get('message')({ data: { type: 'SKIP_WAITING' } });
  assert.equal(h.state.skipped, true);
  await h.lifecycle('activate');
  assert.equal(h.state.claimed, true);
  assert.ok(h.cacheMap.has(current));
  assert.ok(h.cacheMap.has('attachement-pro:/autre-projet/:v1'));
  assert.ok(h.cacheMap.has('autre-application'));
  assert.equal(h.cacheMap.has('attachement-pro:/attachement-pro/:ancienne'), false);
});

test('Une installation incomplète conserve le cache antérieur et supprime seulement le nouveau cache partiel', async () => {
  const h = workerHarness();
  await h.lifecycle('install');
  const current = [...h.cacheMap.keys()][0];
  h.state.failAdds = true;
  await assert.rejects(h.lifecycle('install'), /absente/);
  assert.ok(h.cacheMap.has(current));
  assert.ok(h.cacheMap.get(current).size > 0);
  h.cacheMap.delete(current);
  await assert.rejects(h.lifecycle('install'), /absente/);
  assert.equal(h.cacheMap.has(current), false);
});
