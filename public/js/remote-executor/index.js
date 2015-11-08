import idb from 'idb';

function openDb(name) {
  var maxVersion = 100;
  var version = 1;

  return Promise.resolve().then(function tryOpen() {
    return idb.open(name, version, upgradeDb => {
      upgradeDb.transaction.abort();
    }).catch(err => {
      if (version >= maxVersion) throw err;
      version++;
      return tryOpen();
    });
  });
}

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


self.openIframe = url => {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.addEventListener('load', _ => resolve(iframe));
    iframe.addEventListener('error', _ => reject(Error("iframe failed")));
    iframe.src = url;
    document.body.appendChild(iframe);
  });
};