// This lets the settings server execute code in the 
// context of the app server.
// This is so the settings server can confirm tasks
// have been completed sucessfully
self.addEventListener('message', event => {
  // Bail if it's not this host talking
  if (new URL(event.origin).hostname != location.hostname) return;

  new Promise(resolve => {
    resolve(eval(event.data.eval));
  }).then(result => {
    event.source.postMessage({
      id: event.data.id,
      result
    }, event.origin);
  }).catch(error => {
    event.source.postMessage({
      id: event.data.id,
      error: error.message
    }, event.origin);
  });
});