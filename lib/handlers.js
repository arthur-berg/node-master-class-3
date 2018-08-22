const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

// Base dir of the .data folder. We use this instead of a database

dataBaseDir = path.join(__dirname, "/../.data");

const handlers = {};

handlers.notFound = (data, cb) => {
  cb(404);
};

handlers.users = (data, cb) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, cb);
  } else {
    cb(405);
  }
};

handlers._users = {};

handlers._users.get = (data, cb) => {
  const email =
    typeof data.queryStringObject.email === "string" &&
    data.queryStringObject.email.trim().length > 0
      ? data.queryStringObject.email
      : false;

  if (email) {
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;

    handlers._tokens.verifyToken(token, email, tokenIsValid => {
      if (tokenIsValid) {
        fs.readFile(
          `${dataBaseDir}/users/${email}.json`,
          "utf-8",
          (err, userData) => {
            if (!err && userData) {
              const parsedData = helpers.parseJsonToObject(userData);
              cb(false, parsedData);
            } else {
              cb(400, { Error: "Could not find the specified user" });
            }
          }
        );
      } else {
        cb(403, {
          Error: "Missing required token in header, or token is invalid"
        });
      }
    });
  } else {
    cb(404, { Error: "Missing required field" });
  }
};

handlers._users.post = (data, cb) => {
  const email =
    typeof data.payload.email === "string" &&
    data.payload.email.trim().length > 0
      ? data.payload.email
      : false;

  const firstName =
    typeof data.payload.firstName === "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName
      : false;

  const lastName =
    typeof data.payload.lastName === "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName
      : false;

  const adress =
    typeof data.payload.adress === "string" &&
    data.payload.adress.trim().length > 0
      ? data.payload.adress
      : false;

  if (email && firstName && lastName && adress) {
    const userData = {
      email,
      firstName,
      lastName,
      adress
    };

    fs.readFile(`${dataBaseDir}/users/${email}.json`, "utf8", err => {
      if (err) {
        fs.open(
          `${dataBaseDir}/users/${email}.json`,
          "wx",
          (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
              const stringData = JSON.stringify(userData);
              fs.writeFile(
                `${dataBaseDir}/users/${email}.json`,
                stringData,
                err => {
                  if (!err) {
                    fs.close(fileDescriptor, err => {
                      if (!err) {
                        cb(false);
                      } else {
                        cb(500, { Error: "Error closing file" });
                      }
                    });
                  } else {
                    cb(500, { Error: "Error writing to existing file" });
                  }
                }
              );
            } else {
              cb(500, { Error: "Could not create the new user" });
            }
          }
        );
      } else {
        cb(400, { Error: "A user with that email already exists" });
      }
    });
  } else {
    cb(400, { Error: "Missing required fields" });
  }
};

handlers._users.put = (data, cb) => {
  const email =
    typeof data.payload.email === "string" &&
    data.payload.email.trim().length > 0
      ? data.payload.email
      : false;

  const firstName =
    typeof data.payload.firstName === "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName
      : false;

  const lastName =
    typeof data.payload.lastName === "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName
      : false;

  const adress =
    typeof data.payload.adress === "string" &&
    data.payload.adress.trim().length > 0
      ? data.payload.adress
      : false;

  const userData = {
    email,
    firstName,
    lastName,
    adress
  };

  //@TODO need to create token verification
  console.log("INSIDE USERS PUT");
};

handlers.tokens = (data, cb) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, cb);
  } else {
    cb(405);
  }
};

handlers._tokens = {};

handlers._tokens.post = (data, cb) => {
  const email =
    typeof data.payload.email === "string" &&
    data.payload.email.trim().length > 0
      ? data.payload.email
      : false;
  if (email) {
    fs.readFile(
      `${dataBaseDir}/users/${email}.json`,
      "utf-8",
      (err, userData) => {
        if (!err && userData) {
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            email,
            id: tokenId,
            expires
          };
          const stringData = JSON.stringify(tokenObject);
          fs.open(
            `${dataBaseDir}/tokens/${tokenId}.json`,
            "wx",
            (err, tokenData) => {
              if (!err) {
                fs.writeFile(tokenData, stringData, err => {
                  if (!err) {
                    fs.close(tokenData, err => {
                      if (!err) {
                        cb(false, tokenObject);
                      } else {
                        cb(500, { Error: "Could not close token file" });
                      }
                    });
                  } else {
                  }
                });
              } else {
                cb(500, { Error: "Could not create token" });
              }
            }
          );
        } else {
          cb(400, { Error: "Could not find the specified user" });
        }
      }
    );
  } else {
    cb(400, { Error: "Missing required data" });
  }
};

handlers._tokens.get = (data, cb) => {
  const id =
    typeof data.queryStringObject.id === "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;

  if (id) {
    fs.readFile(
      `${dataBaseDir}/tokens/${id}.json`,
      "utf-8",
      (err, tokenData) => {
        if (!err && tokenData) {
          const parsedData = helpers.parseJsonToObject(tokenData);
          cb(false, parsedData);
        } else {
          cb(400, { Error: "Could not find the specified user" });
        }
      }
    );
  } else {
    cb(400, { Error: "Missing required fields" });
  }
};

handlers._tokens.verifyToken = (id, email, cb) => {
  fs.readFile(`${dataBaseDir}/tokens/${id}.json`, "utf-8", (err, tokenData) => {
    if (!err && tokenData) {
      const parsedData = helpers.parseJsonToObject(tokenData);
      if (parsedData.email === email && parsedData.expires > Date.now()) {
        cb(true);
      } else {
        cb(false);
      }
    } else {
      cb(400, { Error: "Could not find the specified token" });
    }
  });
};

module.exports = handlers;
