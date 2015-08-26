import Busboy from 'busboy';

const RE_MIME = /^(?:multipart\/.+)|(?:application\/x-www-form-urlencoded)$/i;

export default function() {
  return (req, res, next) => {
    if (req.method === 'GET'
    || req.method === 'HEAD'
    || !hasBody(req)
    || !RE_MIME.test(mime(req))) {
      next();
      return;
    }

    const busboy = new Busboy({
      headers: req.headers
    });

    req.body = {};

    busboy.on('finish', _ => next());
    busboy.on('field', (name, val) => req.body[name] = val);
    req.pipe(busboy);
  };
}

function hasBody(req) {
  const encoding = 'transfer-encoding' in req.headers;
  const length = 'content-length' in req.headers && req.headers['content-length'] !== '0';
  return encoding || length;
}

function mime(req) {
  var str = req.headers['content-type'] || '';
  return str.split(';')[0];
}