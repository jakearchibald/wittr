import express from 'express';
import zlib from 'zlib';
import compression from 'compression';
import indexTemplate from './templates/index';
import postTemplate from './templates/post';
import generateMessage from './generateMessage';

const compressor = compression({
  flush: zlib.Z_PARTIAL_FLUSH
});

function createMessage() {
  const message = {};
  const generatedMessage = generateMessage();
  message.avatar = '/imgs/avatar.jpg';
  message.name = 'Jake Archibald';
  message.time = new Date().toISOString();
  message.body = generatedMessage.msg;
  if (generatedMessage.img) {
    message.mainImg = generatedMessage.img;
  }
  return message;
}

export default class Server {
  constructor() {
    this._app = express();
    this._messages = [];

    for (let i = 0; i < 10; i++) {
      const msg = createMessage();
      msg.time = new Date(Date.now() - (1000 * (10 * i))).toISOString();
      this._messages.push(msg);
    }
    
    const staticOptions = {
      maxAge: 0
    };

    this._app.use('/js', express.static('../public/js', staticOptions));
    this._app.use('/css', express.static('../public/css', staticOptions));
    this._app.use('/imgs', express.static('../public/imgs', staticOptions));

    this._app.get('/', compressor, (req, res) => {
      res.send(indexTemplate({
        mainContent: this._messages.map(item => postTemplate(item)).join('')
      }));
    });

    this._app.get('/shell', compressor, (req, res) => {
      res.send(indexTemplate());
    });

    setInterval(_ => this._addMessage(), 1000 * 10)
  }

  _addMessage() {
    this._messages.unshift(createMessage());
    this._messages.pop();
  }

  listen(port) {
    this._app.listen(port, _ => {
      console.log("Server listening at localhost:" + port);
    });
  }
}