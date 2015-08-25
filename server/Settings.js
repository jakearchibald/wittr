import express from 'express';
import zlib from 'zlib';
import compression from 'compression';
import {EventEmitter} from 'events';
import indexTemplate from './templates/index';
import settingsTemplate from './templates/settings';

const compressor = compression({
  flush: zlib.Z_PARTIAL_FLUSH
});

export default class Server extends EventEmitter {
  constructor() {
    super();
    this._app = express();

    const staticOptions = {
      maxAge: 0
    };

    this._app.use('/js', express.static('../public/js', staticOptions));
    this._app.use('/css', express.static('../public/css', staticOptions));
    this._app.use('/imgs', express.static('../public/imgs', staticOptions));

    this._app.get('/', compressor, (req, res) => {
      res.send(indexTemplate({
        extraCss: '<link rel="stylesheet" href="/css/settings.css" />',
        content: settingsTemplate({
          content: "<div class=card>This is the settings server</div>"
        })
      }));
    });
  }

  listen(port) {
    this._app.listen(port, _ => {
      console.log("Config server listening at localhost:" + port);
    });
  }
}