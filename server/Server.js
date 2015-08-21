import express from 'express';
import zlib from 'zlib';
import compression from 'compression';

export default class Server {
  constructor(port) {
    this.app = express();

    const staticOptions = {
      maxAge: 0
    };

    this.app.set('port', port);
    //this.app.use('/js', express.static('../public/js', staticOptions));
    //this.app.use('/css', express.static('../public/css', staticOptions));
    //this.app.use('/imgs', express.static('../public/imgs', staticOptions));

    this.app.get('/', compression({
      flush: zlib.Z_PARTIAL_FLUSH
    }), (req, res) => {
      res.send('This is the server');
    });
    
    this.app.listen(this.app.get('port'), _ => {
      console.log("Server listening at localhost:" + this.app.get('port'));
    });
  }
}