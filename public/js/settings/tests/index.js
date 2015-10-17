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
      return !!navigator.serviceWorker.controller;
    }).then(controlled => {
      if (controlled) return ["Page looks controlled!", '2.gif', true];
      return ["Doesn't look like there's a serviceworker registered :(", 'nope.gif', false];
    });
  }
};