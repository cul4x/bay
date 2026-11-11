/* بَيَان — عامل الخدمة: يخزّن الملفات المحلية مسبقًا، ويخزّن الخطوط عند أول اتصال */
var V = 'bayan-v2';
var LOCAL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(LOCAL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  var fonts = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== location.origin && !fonts) return;
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(r).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); }
        return res;
      }).catch(function () {
        if (r.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504 });
      });
    })
  );
});
