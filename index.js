const http = require("http");
const https = require("https");
const StringDecoder = require("string_decoder").StringDecoder;
const url = require("url");
const fs = require("fs");
const path = require("path");
const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");
const querystring = require("querystring");

const app = {};

app.init = () => {
  app.httpServer.listen(3000, () => {
    console.log("\x1b[36m%s\x1b[0m", "Http server is running on port 3000");
  });

  app.httpsServer.listen(3001, () => {
    console.log("Https server is running on port 3001");
  });
};

app.httpServer = http.createServer((req, res) => {
  app.unifiedServer(req, res);
});

app.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, "/https/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "/https/cert.pem"))
};

app.httpsServer = https.createServer(app.httpsServerOptions, (req, res) => {
  app.unifiedServer(req, res);
});

app.unifiedServer = (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  const path = parsedUrl.pathname;

  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  const queryStringObject = parsedUrl.query;

  const method = req.method.toLowerCase();

  const headers = req.headers;

  let buffer = "";

  const decoder = new StringDecoder();

  req
    .on("data", chunk => {
      buffer += decoder.write(chunk);
    })
    .on("end", () => {
      buffer += decoder.end();

      const chosenHandler =
        typeof app.router[trimmedPath] !== "undefined"
          ? app.router[trimmedPath]
          : handlers.notFound;

      const data = {
        trimmedPath,
        queryStringObject,
        method,
        headers,
        payload: helpers.parseJsonToObject(buffer)
      };

      chosenHandler(data, (statusCode, payload) => {
        statusCode = typeof statusCode === "number" ? statusCode : 200;

        payload = typeof payload === "object" ? payload : {};

        const payloadString = JSON.stringify(payload);

        res.setHeader("Content-Type", "application/json");
        res.writeHead(statusCode);
        res.end(payloadString);
      });
    });
};

app.router = {
  users: handlers.users,
  notFound: handlers.notFound
};

app.init();

module.exports = app;