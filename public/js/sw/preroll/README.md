`index.js` is included in the service worker automatically to make the test-checking script work.

It causes any urls that end `?bypass-sw` to bypass any user-written fetch code.