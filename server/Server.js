import express from 'express';
import zlib from 'zlib';
import compression from 'compression';
import indexTemplate from './templates/index';

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
    //this.app.use('/imgs', express.static('../public/imgs', staticOptions));

    this.app.get('/', compressor, (req, res) => {
      res.send(indexTemplate());
    });
  }

  listen(port) {
    this.app.listen(port, _ => {
      console.log("Server listening at localhost:" + port);
    });
  }
}