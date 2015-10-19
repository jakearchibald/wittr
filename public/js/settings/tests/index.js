import WindowMessenger from './WindowMessenger';

const appOrigin = new URL(location.href);
appOrigin.port = self.config.appPort;
const executorUrl = new URL('/remote?bypass-sw', appOrigin);

function remoteEval(js) {
  const messenger = new WindowMessenger(executorUrl);
  let error;

  if (typeof js === 'function') {
    js = '(' + js.toString() + ')()';
  }

  return messenger.message({
    eval: js
  }).catch(err => {
    error = err;
  }).then(val => {
    messenger.destruct();
    if (error) throw error;
    return val;
  });
}

function figureOutConnectionType() {
  const start = performance.now();

  return Promise.race([
    fetch(new URL('/ping', appOrigin)),
    new Promise(r => setTimeout(r, 4000))
  ]).then(_ => {
    const duration = performance.now() - start;

    if (duration < 3000) {
      return 'perfect';
    }
    if (duration < 3500) {
      return 'slow';
    }
    return 'lie-fi';
  }, _ => {
    return 'offline';
  });
}

export default {
  demo() {
    return Promise.resolve(["Yep, the demo's working!", 'demo.gif', true]);
  },
  offline() {
    return figureOutConnectionType().then(type => {
      if (type == 'offline') {
        return ["Yep! The server is totally dead!", '1.gif', true];
      }
      return ["Hmm, no, looks like the server is still up", 'nope.gif', false];
    });
  },
  'lie-fi': function() {
    return figureOutConnectionType().then(type => {
      switch(type) {
        case "lie-fi":
          return ["Yeeeep, that's lie-fi alright.", '2.gif', true];
        case "offline":
          return ["Hmm, no, looks like the server is down.", 'nope.gif', false];
        default:
          return ["The server responded way too fast for lie-fi.", 'not-quite.gif', false];
      }
    });
  },
  registered() {
    return remoteEval(function() {
      if (navigator.serviceWorker.controller) return ["Service worker successfully registered!", '3.gif', true];
      return ["Doesn't look like there's a service worker registered :(", 'nope.gif', false];
    });
  },
  'sw-waiting': function() {
    return remoteEval(function() {
      return navigator.serviceWorker.getRegistration('/').then(reg => {
        if (!reg) return ["Doesn't look like there's a service worker registered at all!", 'sad.gif', false];
        if (!reg.waiting) return ["There's no service worker waiting", 'nope.gif', false];
        return ["Yey! There's a service worker waiting!", "4.gif", true];
      });
    });
  },
  'sw-active': function() {
    return remoteEval(function() {
      return navigator.serviceWorker.getRegistration('/').then(reg => {
        if (!reg) return ["Doesn't look like there's a service worker registered at all!", 'sad.gif', false];
        if (reg.waiting) return ["There's still a service worker waiting", 'nope.gif', false];
        return ["No service worker waiting! Yay!", "5.gif", true];
      });
    });
  },
  'html-response': function() {
    return remoteEval(function() {
      return fetch('/').then(response => {
        const type = response.headers.get('content-type');

        if (!type || (type.toLowerCase() != 'text/html' && !type.toLowerCase().startsWith('text/html'))) {
          return ["The response doesn't have the 'Content-Type: text/html' header", 'nope.gif', false];
        }

        return response.text().then(text => new DOMParser().parseFromString(text, 'text/html')).then(doc => {
          if (doc.body.querySelector('.a-winner-is-me')) {
            return ["Custom HTML response found! Yay!", "6.gif", true];
          }
          return ["Can't find an element with class 'a-winner-is-me'", 'nope.gif', false];
        });
      });
    });
  }
};