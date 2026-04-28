const CACHE_NAME = "todo-app-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./ToDo_style.css",
  "./ToDo_script.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});