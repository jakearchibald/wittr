self.addEventListener('fetch', function(event) {
  // TODO: only respond to requests with a
  // url ending in ".jpg"
  event.respondWith(
    fetch('/imgs/dr-evil.gif')
  );
});