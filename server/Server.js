import express from 'express';
import zlib from 'zlib';
import compression from 'compression';
import indexTemplate from './templates/index';
import postTemplate from './templates/post';

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
      res.send(indexTemplate({
        mainContent: [
          {
            mainImg: {url: '/imgs/wolff.jpg', alt: ''},
            avatar: '/imgs/avatar.jpg',
            name: 'Jake Archibald',
            time: '2015-08-24T10:34:17.777Z',
            body: 'A team somewhere spent a long time ensuring Southern Rail ticket machines are as fustrating as possible.'
          },
          {
            avatar: '/imgs/avatar.jpg',
            name: 'Jake Archibald',
            time: '2015-08-24T10:34:17.777Z',
            body: 'A team somewhere spent a long time ensuring Southern Rail ticket machines are as fustrating as possible.'
          }
        ].map(item => postTemplate(item)).join('')
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