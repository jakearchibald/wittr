self.addEventListener('fetch', function(event) {
  event.respondWith(
    new Response('<strong class="a-winner-is-me">Hello!</strong>', {
      headers: {'Content-Type': 'text/html'}
    })
  );
});