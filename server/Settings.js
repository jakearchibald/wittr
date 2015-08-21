import express from 'express';
import zlib from 'zlib';
import compression from 'compression';
import {EventEmitter} from 'events';

const compressor = compression({
  flush: zlib.Z_PARTIAL_FLUSH
});

export default class Server extends EventEmitter {
  constructor() {
    super();
    this.app = express();

    const staticOptions = {
      maxAge: 0
    };

    this.app.get('/', compressor, (req, res) => {
      res.send('This is the config server');
    });
  }

  listen(port) {
    this.app.listen(port, _ => {
      console.log("Config server listening at localhost:" + port);
    });
  }
}