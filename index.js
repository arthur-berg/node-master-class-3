const http = require('http');
const https = require('https');
const StringDecoder = require('string_decoder').StringDecoder;
const url = require('url');
const fs = require('fs');
const path = require('path');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
const querystring = require('querystring');
const config = require('./lib/config');

const app = {};

app.init = () => {
  app.httpServer.listen(config.httpPort, () => {
    console.log(
      '\x1b[36m%s\x1b[0m',
      `Http server is running on port ${config.httpPort}`
    );
  });

  app.httpsServer.listen(config.httpsPort, () => {
    console.log(`Https server is running on port ${config.httpsPort}`);
  });
};

app.httpServer = http.createServer((req, res) => {
  app.unifiedServer(req, res);
});

app.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, '/https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '/https/cert.pem'))
};

app.httpsServer = https.createServer(app.httpsServerOptions, (req, res) => {
  app.unifiedServer(req, res);
});

app.unifiedServer = (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  const path = parsedUrl.pathname;

  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  const queryStringObject = parsedUrl.query;

  const method = req.method.toLowerCase();

  const headers = req.headers;

  let buffer = '';

  const decoder = new StringDecoder();

  req
    .on('data', chunk => {
      buffer += decoder.write(chunk);
    })
    .on('end', () => {
      buffer += decoder.end();

      let chosenHandler =
        typeof app.router[trimmedPath] !== 'undefined'
          ? app.router[trimmedPath]
          : handlers.notFound;

      // If the request is within the public directory use to the public handler instead
      chosenHandler =
        trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

      const data = {
        trimmedPath,
        queryStringObject,
        method,
        headers,
        payload: helpers.parseJsonToObject(buffer)
      };

      chosenHandler(data, (statusCode, payload, contentType) => {
        statusCode = typeof statusCode === 'number' ? statusCode : 200;

        contentType = typeof contentType == 'string' ? contentType : 'json';

        let payloadString = '';
        console.log('contentType', contentType);
        if (contentType == 'json') {
          res.setHeader('Content-Type', 'application/json');
          payload = typeof payload == 'object' ? payload : {};
          payloadString = JSON.stringify(payload);
        }

        if (contentType == 'html') {
          res.setHeader('Content-Type', 'text/html');
          payloadString = typeof payload == 'string' ? payload : '';
        }

        if (contentType == 'favicon') {
          res.setHeader('Content-Type', 'image/x-icon');
          payloadString = typeof payload !== 'undefined' ? payload : '';
        }

        if (contentType == 'plain') {
          res.setHeader('Content-Type', 'text/plain');
          payloadString = typeof payload !== 'undefined' ? payload : '';
        }

        if (contentType == 'css') {
          res.setHeader('Content-Type', 'text/css');
          payloadString = typeof payload !== 'undefined' ? payload : '';
        }

        if (contentType == 'png') {
          res.setHeader('Content-Type', 'image/png');
          payloadString = typeof payload !== 'undefined' ? payload : '';
        }

        if (contentType == 'jpg') {
          res.setHeader('Content-Type', 'image/jpeg');
          payloadString = typeof payload !== 'undefined' ? payload : '';
        }

        res.writeHead(statusCode);
        res.end(payloadString);
      });
    });
};

app.router = {
  '': handlers.index,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/notFound': handlers.notFound,
  'api/menu_items': handlers.menu_items,
  'api/orders': handlers.orders,
  'account/create': handlers.accountCreate,
  'order/create': handlers.orderCreate,
  'session/deleted': handlers.sessionDeleted,
  'session/created': handlers.sessionCreated,
  public: handlers.public
};

app.init();

module.exports = app;
