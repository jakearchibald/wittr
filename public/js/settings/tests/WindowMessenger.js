export default class WindowMessenger {
  constructor(url) {
    this._requestId = 0;
    
    this._iframe = document.createElement('iframe');
    this._iframe.className = 'hidden-tester';
    this._ready = new Promise((resolve, reject) => {
      const listener = e => {
        resolve();
        this._iframe.removeEventListener('load', listener);
        this._iframe.removeEventListener('error', errorListener);
      };
      const errorListener = e => {
        reject(Error("Iframe load failed"));
        this._iframe.removeEventListener('load', listener);
        this._iframe.removeEventListener('error', errorListener);
      };
      this._iframe.addEventListener('load', listener);
      this._iframe.addEventListener('error', errorListener);
      this._iframe.src = url;
    });
    document.body.appendChild(this._iframe);

    this._targetOrigin = new URL(url).origin;

    this._windowListener = event => this._onMessage(event);
    self.addEventListener('message', this._windowListener);

    // message jobs awaiting response {callId: [resolve, reject]}
    this._pending = {};
  }

  destruct() {
    document.body.removeChild(this._iframe);
    self.removeEventListener('message', this._windowListener);
  }

  _onMessage(event) {
    if (event.origin != this._targetOrigin) return;

    if (!event.data.id) {
      console.log("Unexpected message", event);
      return;
    }

    var resolver = this._pending[event.data.id];

    if (!resolver) {
      console.log("No resolver for", event);
      return;
    }

    delete this._pending[event.data.id];

    if (event.data.error) {
      resolver[1](new Error(event.data.error));
      return;
    }

    resolver[0](event.data.result);
  }

  message(message) {
    return this._ready.then(_ => {
      const requestId = ++this._requestId;
      message.id = requestId;

      return new Promise((resolve, reject) => {
        this._pending[requestId] = [resolve, reject];
        this._iframe.contentWindow.postMessage(message, this._targetOrigin);
      });
    });
  }
}
