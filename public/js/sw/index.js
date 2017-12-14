self.addEventListener('install', function(event) {
  event.waitUntil(
    // 3.17
    // TODO: open a cache named 'wittr-static-v1'
    // Add cache the urls from urlsToCache
    // caches.open('wittr-static-v1').then(function(cache) {
    // 3.20
    // TODO: change the site's theme, eg swap the vars in public/scss/_theme.scss
    // Ensure at least $primary-color changes
    // TODO: change cache name to 'wittr-static-v2'
    caches.open('wittr-static-v2').then(function(cache) {
      return cache.addAll([
        '/',
        'js/main.js',
        'css/main.css',
        'imgs/icon.png',
        'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
        'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    // 3.20
    // TODO: remove the old cache
    caches.delete('wittr-static-v1')
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    // 3.18
    // TODO: respond with an entry from the cache if there is one.
    // If there isn't, fetch from the network.
    caches.match(event.request).then(function(response) {
      // If request is truthy, return response
      if (response) return response;
      // Or fetch to the network for the original response
      return fetch(event.request)
    })
  );
});

// self.addEventListener('fetch', function(event) {
  // 3.15
  // fetch(event.request).then(function(response) {
  //   if (response.status === 404) {
  //     TODO: instead, respond with the gif at
  //     /imgs/dr-evil.gif
  //     using a network request
  //     return fetch('/imgs/dr-evil.gif');
  //   }
  //   return response;
  // }).catch(function() {
  //   return new Response("Uh oh, that totally failed!");


  // 3.13
  // TODO: only respond to requests with a
  // url ending in ".jpg"
  // if (event.request.url.endsWith('.jpg')) {
  //  event.respondWith(
  //    fetch('/imgs/dr-evil.gif')
  //  )
  // };

  // 3.11
  // TODO: respond to all requests with an html response
	// containing an element with class="a-winner-is-me".
	// Ensure the Content-Type of the response is "text/html"
  // event.respondWith(
  //  new Response('<b class="a-winner-is-me">Hello!</b>', {
  //   headers: {'Content-Type': 'text/html'}
  //  })
  // )

// });
