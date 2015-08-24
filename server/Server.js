import express from 'express';
import zlib from 'zlib';
import compression from 'compression';
import indexTemplate from './templates/index';
import postTemplate from './templates/post';
import generateMessage from './generateMessage';

const compressor = compression({
  flush: zlib.Z_PARTIAL_FLUSH
});

export default class Server {
  constructor() {
    this.app = express();

    const staticOptions = {
      maxAge: 0
    };

    this.app.use('/js', express.static('../public/js', staticOptions));
    this.app.use('/css', express.static('../public/css', staticOptions));
    this.app.use('/imgs', express.static('../public/imgs', staticOptions));

    this.app.get('/', compressor, (req, res) => {
      const messages = [];

      for (let i = 0; i < 10; i++) {
        const message = {};
        const generatedMessage = generateMessage();
        message.avatar = '/imgs/avatar.jpg';
        message.name = 'Jake Archibald';
        message.time = '2015-08-24T10:34:17.777Z';
        message.body = generatedMessage.msg;
        if (generatedMessage.img) {
          message.mainImg = generatedMessage.img;
        }
        messages.push(message);
      }
      res.send(indexTemplate({
        mainContent: messages.map(item => postTemplate(item)).join('')
      }));
    });

    this.app.get('/shell', compressor, (req, res) => {
      res.send(indexTemplate());
    });
  }

  listen(port) {
    this.app.listen(port, _ => {
      console.log("Server listening at localhost:" + port);
    });
  }
}