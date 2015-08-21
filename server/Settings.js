import express from 'express';
import zlib from 'zlib';
import compression from 'compression';
import {EventEmitter} from 'events';

export default class Server extends EventEmitter {
  constructor(port) {
    super();
    this.app = express();

    const staticOptions = {
      maxAge: 0
    };

    this.app.set('port', port);

    this.app.get('/', compression({
      flush: zlib.Z_PARTIAL_FLUSH
    }), (req, res) => {
      res.send('This is the config server');
    });
    
    this.app.listen(this.app.get('port'), _ => {
      console.log("Config server listening at localhost:" + this.app.get('port'));
    });
  }
}