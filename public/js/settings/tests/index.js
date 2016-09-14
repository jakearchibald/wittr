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

  return figureOutConnectionType().then(type => {
    if (type === 'offline') return ["Looks like the server is offline", 'sad.gif', false];

    return messenger.message({
      eval: js
    }).catch(err => {
      error = err;
    }).then(val => {
      messenger.destruct();
      if (error) throw error;
      return val;
    });
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
  ['lie-fi']() {
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
  ['sw-waiting']() {
    return remoteEval(function() {
      return navigator.serviceWorker.getRegistration('/').then(reg => {
        if (!reg) return ["Doesn't look like there's a service worker registered at all!", 'sad.gif', false];
        if (!reg.waiting) return ["There's no service worker waiting", 'nope.gif', false];
        return ["Yey! There's a service worker waiting!", "4.gif", true];
      });
    });
  },
  ['sw-active']() {
    return remoteEval(function() {
      return navigator.serviceWorker.getRegistration('/').then(reg => {
        if (!reg) return ["Doesn't look like there's a service worker registered at all!", 'sad.gif', false];
        if (reg.waiting) return ["There's still a service worker waiting", 'nope.gif', false];
        return ["No service worker waiting! Yay!", "5.gif", true];
      });
    });
  },
  ['html-response']() {
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
  },
  ['gif-response']() {
    return remoteEval(function() {
      return fetch('/').then(response => {
        const type = response.headers.get('content-type');

        if (!type || !type.toLowerCase().startsWith('text/html')) {
          return ["Looks like it isn't just URLs ending with .jpg that are being intercepted", 'not-quite.gif', false];
        }

        return fetch('/blah.jpg').then(response => {
          const type = response.headers.get('content-type');

          if (!type || !type.toLowerCase().startsWith('image/gif')) {
            return ["Doesn't look like urls ending .jpg are getting a gif in response", 'no-cry.gif', false];
          }

          return ["Images are being intercepted!", "7.gif", true];
        })
      });
    })
  },
  ['gif-404']() {
    return remoteEval(function() {
      return Promise.all([
        fetch('/'),
        fetch('/imgs/dr-evil.gif?bypass-sw'),
        fetch('/' + Math.random())
      ]).then(responses => {
        const pageType = responses[0].headers.get('content-type');

        if (!pageType || !pageType.toLowerCase().startsWith('text/html')) {
          return ["Looks like non-404 pages are getting the gif too", 'not-quite.gif', false];
        }

        const type = responses[2].headers.get('content-type');

        if (!type || !type.toLowerCase().startsWith('image/gif')) {
          return ["Doesn't look like 404 responses are getting a gif in return", 'nope.gif', false];
        }

        return Promise.all(
          responses.slice(1).map(r => r.arrayBuffer().then(b => new Uint8Array(b)))
        ).then(arrays => {
          const itemsToCheck = 2000;
          const a1 = arrays[0];
          const a2 = arrays[1];

          for (let i = 0; i < itemsToCheck; i++) {
            if (a1[i] !== a2[i]) {
              return ["Doesn't look like 404 responses are getting the dr-evil gif in return", 'not-quite.gif', false];
            }
          }
          return ["Yay! 404 pages get gifs!", "8.gif", true];
        })
      })
    });
  },
  ['install-cached']() {
    return remoteEval(function() {
      const expectedUrls = [
        '/',
        '/js/main.js',
        '/css/main.css',
        '/imgs/icon.png',
        'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
        'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
      ].map(url => new URL(url, location).href);

      return caches.has('wittr-static-v1').then(has => {
        if (!has) return ["Can't find a cache named wittr-static-v1", 'nope.gif', false];

        return caches.open('wittr-static-v1').then(c => c.keys()).then(reqs => {
          const urls = reqs.map(r => r.url);
          const allAccountedFor = expectedUrls.every(url => urls.includes(url));

          if (allAccountedFor) {
            return ["Yay! The cache is ready to go!", "9.gif", true];
          }
          return ["The cache is there, but it's missing some things", 'not-quite.gif', false];
        });
      })
    });
  },
  ['cache-served']() {
    return remoteEval(function() {
      return Promise.all([
        fetch('/'),
        fetch('/ping').then(r => r.json()).catch(e => ({ok: false}))
      ]).then(responses => {
        const cachedResponse = responses[0];
        const jsonResponse = responses[1];

        if (!jsonResponse.ok) return ["Doesn't look like non-cached requests are getting through", 'not-quite.gif', false];

        return new Promise(r => setTimeout(r, 2000)).then(_ => fetch('/')).then(response => {
          if (cachedResponse.headers.get('Date') === response.headers.get('Date')) {
            return ["Yay! Cached responses are being returned!", "10.gif", true];
          }
          return ["Doesn't look like responses are returned from the cache", 'nope.gif', false];
        })
      });
    });
  },
  ['new-cache-ready']() {
    return remoteEval(function() {
      return Promise.all([
        caches.has('wittr-static-v1'),
        caches.has('wittr-static-v2')
      ]).then(hasCaches => {
        if (!hasCaches[0]) return ["Looks like the v1 cache has already gone", 'sad.gif', false];
        if (!hasCaches[1]) return ["Can't find the wittr-static-v2 cache", 'sad.gif', false];

        return Promise.all(
          ['wittr-static-v1', 'wittr-static-v2'].map(name => {
            return caches.open(name)
              .then(c => c.match('/css/main.css'))
              .then(r => r && r.text())
          })
        ).then(cssTexts => {
          if (!cssTexts[0]) return ["Can't find CSS in the v1 cache", 'sad.gif', false];
          if (!cssTexts[1]) return ["Can't find CSS in the v2 cache", 'sad.gif', false];

          if (cssTexts[0] === cssTexts[1]) {
            return ["There's a new cache, but the CSS looks the same", 'nope.gif', false];
          }
          return ["Yay! The new cache is ready, but isn't disrupting current pages", "11.gif", true];
        });
      });
    })
  },
  ['new-cache-used']() {
    return remoteEval(function() {
      return Promise.all([
        caches.has('wittr-static-v1'),
        caches.has('wittr-static-v2')
      ]).then(hasCaches => {
        if (hasCaches[0]) return ["Looks like the v1 cache is still there", 'not-quite.gif', false];
        if (!hasCaches[1]) return ["Can't find the wittr-static-v2 cache", 'sad.gif', false];

        return Promise.all([
          fetch('/css/main.css'),
          new Promise(r => setTimeout(r, 2000)).then(_ => fetch('/css/main.css'))
        ]).then(responses => {
          if (responses[0].headers.get('Date') != responses[1].headers.get('Date')) {
            return ["Doesn't look like the CSS is being served from the cache", 'mistake.gif', false];
          }

          return openIframe('/').then(iframe => {
            const win = iframe.contentWindow;
            const doc = win.document;
            const bg = win.getComputedStyle(doc.querySelector('.toolbar')).backgroundColor;

            if (bg == 'rgb(63, 81, 181)') {
              return ["Doesn't look like the header color has changed", 'no-cry.gif', false]; 
            }
            return ["Yay! You safely updated the CSS!", "12.gif", true];
          });
        })
      })
    });
  },
  ['update-notify']() {
    return remoteEval(function() {
      return navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg.waiting) return ["Doesn't look like there's a waiting worker", 'nope.gif', false];

        return openIframe('/').then(iframe => {
          const win = iframe.contentWindow;
          const doc = win.document;

          return new Promise(r => setTimeout(r, 500)).then(_ => {
            if (doc.querySelector('.toast')) {
              return ["Yay! There are notifications!", "13.gif", true];
            }
            return ["Doesn't look like there's a notification being triggered", 'sad.gif', false];
          })
        });
      });
    })
  },
  ['update-reload']() {
    return remoteEval(function() {
      return navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg.waiting) return ["Doesn't look like there's a waiting worker", 'nope.gif', false];

        return openIframe('/').then(iframe => {
          const win = iframe.contentWindow;
          const doc = win.document;

          return new Promise(resolve => {
            setTimeout(_ => resolve(["Didn't detect the page being reloaded :(", 'sad.gif', false]), 8000);
            iframe.addEventListener('load', _ => {
              resolve(["Yay! The page reloaded!", "14.gif", true]);
            })
          });
        });
      });
    })
  },
  ['serve-skeleton']() {
    return remoteEval(function() {
      return fetch('/').then(r => r.text()).then(text => {
        if (text.includes('post-content')) {
          return ["Doesn't look like the page skeleton is being served", 'nope.gif', false];
        }

        return fetch('https://google.com/').then(r => r.text()).catch(e => '').then(gText => {
          if (gText == text) {
            return ["Looks like you're serving the skeleton for https://google.com/ too!", 'not-quite.gif', false];
          }
          return ["Yay! The page skeleton is being served!", "15.gif", true];
        });
      });
    });
  },
  ['idb-animal']() {
    return remoteEval(function() {
      return openDb('test-db').then(db => {
        const tx = db.transaction('keyval');
        return tx.objectStore('keyval').get('favoriteAnimal').then(animal => {
          if (!animal) return ["Can't find favoriteAnimal in keyval", 'nope.gif', false];
          return ["Yay! Your favorite animal is \"" + animal + "\"", "16.gif", true];
        })
      }, err => {
        return ["Couldn't open the test-db database at all :(", 'sad.gif', false];
      })
    });
  },
  ['idb-age']() {
    return remoteEval(function() {
      return openDb('test-db').then(db => {
        if (!Array.from(db.objectStoreNames).includes('people')) {
          return ["Can't find the 'people' objectStore", 'mistake.gif', false]; 
        }

        const tx = db.transaction('people');
        const store = tx.objectStore('people');

        if (!Array.from(store.indexNames).includes('age')) {
          return ["Can't find the 'age' index in the 'people' objectStore", 'sad.gif', false];
        }

        const index = store.index('age');

        if (index.keyPath == 'age') {
          return ["Yay! The age index is working", "17.gif", true];
        }

        return ["The age index isn't indexed by age", 'nope.gif', false];
      }, err => {
        return ["Couldn't open the test-db database at all :(", 'sad.gif', false];
      })
    });
  },
  ['idb-store']() {
    return remoteEval(function() {
      return openDb('wittr').then(db => {
        if (!Array.from(db.objectStoreNames).includes('wittrs')) {
          return ["There isn't a 'wittrs' objectStore", 'sad.gif', false];
        }

        const tx = db.transaction('wittrs');
        const store = tx.objectStore('wittrs');

        if (store.keyPath != 'id') {
          return ["'wittrs' objectStore doesn't use 'id' as its primary key", 'nope.gif', false];
        }

        if (!Array.from(store.indexNames).includes('by-date')) {
          return ["There isn't a 'by-date' index on the 'wittrs' objectStore", 'nope.gif', false];
        }

        const index = store.index('by-date');

        if (index.keyPath != 'time') {
          return ["The 'by-date' index isn't using 'time' as its key", 'nope.gif', false];
        }

        return store.getAll().then(messages => {
          if (!messages.length) {
            return ["The objectStore is there, but it's empty", 'sad.gif', false];
          }

          const looksMessagey = messages.every(message => {
            return message.id && message.avatar && message.name && message.time && message.body;
          });

          if (looksMessagey) {
            return ["The database is set up and populated!", "18.gif", true];
          }

          return ["Looks like some incorrect data is in the database", 'not-quite.gif', false];
        });
      }, () => {
        return ["Couldn't open the 'wittr' database at all :(", 'sad.gif', false];
      });
    });
  },
  ['idb-show']() {
    return remoteEval(function() {
      return openDb('wittr').then(db => {
        return openIframe('/?no-socket').then(iframe => {
          const win = iframe.contentWindow;
          const doc = win.document;

          return new Promise(r => setTimeout(r, 500)).then(() => {
            const times = Array.from(doc.querySelectorAll('.post-content time'));
            if (!times.length) return ["Page looks empty without the web socket", 'nope.gif', false];

            const inOrder = times.map(t => new Date(t.getAttribute('datetime'))).every((time, i, arr) => {
              const nextTime = arr[i+1];
              if (!nextTime) return true;
              return time >= nextTime;
            });

            if (!inOrder) return ["So close! But the newest post should appear at the top", 'not-quite.gif', false];
            return ["Page populated from IDB!", "19.gif", true];
          });
        });
      }, () => {
        return ["Couldn't open the 'wittr' database at all :(", 'sad.gif', false];
      });
    });
  },
  ['idb-clean']() {
    return remoteEval(function() {
      return openDb('wittr').then(db => {
        const tx = db.transaction('wittrs');
        const store = tx.objectStore('wittrs');

        return store.count().then(num => {
          if (num > 30) {
            return ["There are more than 30 items in the store", 'nope.gif', false];
          }

          if (num < 30) {
            return ["There are less than 30 items in the store, so it isn't clear if this is working", 'not-quite.gif', false];
          }

          return ["Looks like the database is being cleaned!", "20.gif", true];
        });
      }, () => {
        return ["Couldn't open the 'wittr' database at all :(", 'sad.gif', false];
      });
    });
  },
  ['cache-photos']() {
    return remoteEval(function() {
      return caches.has('wittr-content-imgs').then(hasCache => {
        if (!hasCache) return ["There isn't a 'wittr-content-imgs' cache", 'sad.gif', false];

        // clear cache
        return caches.delete('wittr-content-imgs').then(() => {
          const imageUrlSmall = '/photos/4-3087-2918949798-865f134ef3-320px.jpg';
          const imageUrlMedium = '/photos/4-3087-2918949798-865f134ef3-640px.jpg';

          return fetch(imageUrlMedium).then(medResponse => {
            return new Promise(r => setTimeout(r, 2000))
              .then(() => fetch(imageUrlMedium)).then(anotherMedResponse => {
                if (medResponse.headers.get('Date') != anotherMedResponse.headers.get('Date')) {
                  return ["Doesn't look like images are being returned from the cache", 'nope.gif', false];
                }

                return fetch(imageUrlSmall).then(smallResponse => {
                  return Promise.all([smallResponse.blob(), medResponse.blob()]);
                }).then(blobs => {
                  if (blobs[0].size != blobs[1].size) {
                    return ["The originally cached image isn't being returned for different sizes", 'nope.gif', false];
                  }
                  return ["Photos are being cached and served correctly!", "21.gif", true];
                });
              });
          });
        });
      });
    });
  },
  ['cache-clean']() {
    return remoteEval(function() {
      return caches.open('wittr-content-imgs').then(cache => {
        const imageUrlMedium = '/photos/4-3087-2918949798-865f134ef3-640px.jpg';

        return fetch(imageUrlMedium).then(r => r.blob()).then(() => new Promise(r => setTimeout(r, 500))).then(() => {
          return cache.match('/photos/4-3087-2918949798-865f134ef3').then(response => {
            if (!response) return ["Photos aren't appearing in the cache where we'd expect", 'not-quite.gif', false];

            const start = Date.now();

            return Promise.resolve().then(function checkCache() {
              if (Date.now() - start > 8000) {
                return ["The image cache doesn't seem to be getting cleaned", 'nope.gif', false]; 
              }

              return cache.match('/photos/4-3087-2918949798-865f134ef3').then(response => {
                if (!response) {
                  return ["Yay! The image cache is being cleaned!", '22.gif', true];
                }
                return new Promise(r => setTimeout(r, 100)).then(checkCache);
              });
            });
          });
        });
      });
    });
  },
  ['cache-avatars']() {
    return remoteEval(function() {
      return caches.delete('wittr-content-imgs').then(() => {
        const imageUrlSmall = '/avatars/marc-1x.jpg';
        const imageUrlMedium = '/avatars/marc-2x.jpg';

        return fetch(imageUrlSmall).then(smallResponse => {
          return new Promise(r => setTimeout(r, 2000))
            .then(() => fetch(imageUrlMedium)).then(medResponse => {
              if (smallResponse.headers.get('Date') != medResponse.headers.get('Date')) {
                return ["Doesn't look like avatars are being returned from the cache, even if the request is for a different size", 'nope.gif', false];
              }

              return new Promise(r => setTimeout(r, 2000)).then(() => fetch(imageUrlMedium)).then(anotherMedResponse => {
                if (medResponse.headers.get('Date') == anotherMedResponse.headers.get('Date')) {
                  return ["Doesn't look like avatars are being updated after being returned from the cache", 'nope.gif', false];
                }
                return ["Avatars are being cached, served and updated correctly!", "23.gif", true];
              });
            });
        });
      });
    });
  }
};