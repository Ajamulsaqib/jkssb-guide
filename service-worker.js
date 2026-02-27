const CACHE_NAME = "jkssb-guide-v1";

const FILES_TO_CACHE = [
  "index.html",
  "start-guide.html",
  "create-account.html",
  "academics.html",
  "documents.html",
  "live-photo.html",
  "apply-posts.html",
  "preference.html",
  "about-developer.html",
  "style.css",
  "script.js",
  "manifest.json"
];

// Install
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});