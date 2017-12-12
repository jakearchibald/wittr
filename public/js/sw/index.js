self.addEventListener('fetch', function(event) {
  // TODO: only respond to requests with a
  // url ending in ".jpg"
  if (event.request.url.endsWith('.jpg')) {
    event.respondWith(
      fetch('/imgs/dr-evil.gif')
    )
  };

  // TODO: respond to all requests with an html response
	// containing an element with class="a-winner-is-me".
	// Ensure the Content-Type of the response is "text/html"
  //event.respondWith(
  // new Response('<b class="a-winner-is-me">Hello!</b>', {
  //  headers: {'Content-Type': 'text/html'}
  // })
  //)
});