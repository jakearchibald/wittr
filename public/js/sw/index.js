self.addEventListener('fetch', function(event) {
  console.log('hello', event.request);
});