const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

// Base dir of the .data folder. We use this instead of a database

const menu_items = ["chicken", "ham", "beef", "vegetables", "cheese"];

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
      ? data.queryStringObject.email.trim()
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
              delete parsedData.hashedPassword;
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
      ? data.payload.email.trim()
      : false;

  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  const firstName =
    typeof data.payload.firstName === "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;

  const lastName =
    typeof data.payload.lastName === "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  const adress =
    typeof data.payload.adress === "string" &&
    data.payload.adress.trim().length > 0
      ? data.payload.adress.trim()
      : false;

  let shoppingList =
    typeof data.payload.shoppingList === "object" &&
    data.payload.shoppingList instanceof Array
      ? data.payload.shoppingList
      : false;

  let menuItemAllowed = true;
  if (shoppingList && shoppingList.length > 0) {
    shoppingList.forEach(item => {
      if (menu_items.indexOf(item) === -1) {
        shoppingList = false;
        menuItemAllowed = false;
      }
    });
  }
  if (menuItemAllowed) {
    if (email && firstName && lastName && adress && password && shoppingList) {
      const hashedPassword = helpers.hash(password);
      if (hashedPassword) {
        const userData = {
          email,
          hashedPassword,
          firstName,
          lastName,
          adress,
          shoppingList
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
        cb(500, { Error: "Could not hash password" });
      }
    } else {
      cb(400, { Error: "Missing required fields" });
    }
  } else {
    cb(400, { Error: "Menu item is not allowed" });
  }
};

handlers._users.put = (data, cb) => {
  const email =
    typeof data.payload.email === "string" &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;

  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  const firstName =
    typeof data.payload.firstName === "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;

  const lastName =
    typeof data.payload.lastName === "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  const adress =
    typeof data.payload.adress === "string" &&
    data.payload.adress.trim().length > 0
      ? data.payload.adress.trim()
      : false;

  let shoppingList =
    typeof data.payload.shoppingList === "object" &&
    data.payload.shoppingList instanceof Array
      ? data.payload.shoppingList
      : false;
  let menuItemAllowed = true;
  if (shoppingList && shoppingList.length > 0) {
    shoppingList.forEach(item => {
      if (menu_items.indexOf(item) === -1) {
        shoppingList = false;
        menuItemAllowed = false;
        return false;
      }
    });
  }
  if (email) {
    if (menuItemAllowed) {
      if (password || firstName || lastName || adress || shoppingList) {
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
                  // Update the fields if necessary
                  if (firstName) {
                    parsedData.firstName = firstName;
                  }
                  if (lastName) {
                    parsedData.lastName = lastName;
                  }
                  if (password) {
                    parsedData.hashedPassword = helpers.hash(password);
                  }
                  if (adress) {
                    parsedData.adress = adress;
                  }
                  if (shoppingList) {
                    parsedData.shoppingList = shoppingList;
                  }
                  fs.open(
                    `${dataBaseDir}/users/${email}.json`,
                    "r+",
                    (err, fileDescriptor) => {
                      if (!err && fileDescriptor) {
                        const stringData = JSON.stringify(parsedData);
                        fs.truncate(fileDescriptor, err => {
                          if (!err) {
                            fs.writeFile(fileDescriptor, stringData, err => {
                              if (!err) {
                                fs.close(fileDescriptor, err => {
                                  if (!err) {
                                    cb(200);
                                  } else {
                                    cb(500, { Error: "Could not close file" });
                                  }
                                });
                              } else {
                                cb(500, { Error: "Could not write to file" });
                              }
                            });
                          } else {
                            cb(500, { Error: "Could not truncate file" });
                          }
                        });
                      } else {
                        cb(500, { Error: "Could not open file" });
                      }
                    }
                  );
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
      }
    } else {
      cb(400, { Error: "Menu item is not allowed" });
    }
  } else {
    cb(400, { Error: "Missing required fields" });
  }
};

handlers._users.delete = (data, cb) => {
  const email =
    typeof data.queryStringObject.email === "string" &&
    data.queryStringObject.email.trim().length > 0
      ? data.queryStringObject.email.trim()
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
              fs.unlink(`${dataBaseDir}/users/${email}.json`, err => {
                if (!err) {
                  cb(200);
                } else {
                  cb(500, { Error: "Could not delete the specified user" });
                }
              });
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
    cb(400, { Error: "Missing required fields" });
  }
};

handlers.menu_items = (data, cb) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._menu_items[data.method](data, cb);
  } else {
    cb(405);
  }
};

handlers._menu_items = {};

handlers._menu_items.get = (data, cb) => {
  const email =
    typeof data.queryStringObject.email === "string" &&
    data.queryStringObject.email.trim().length > 0
      ? data.queryStringObject.email.trim()
      : false;

  if (email) {
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;
    handlers._tokens.verifyToken(token, email, tokenIsValid => {
      if (tokenIsValid) {
        cb(200, menu_items);
      } else {
        cb(403, {
          Error: "Missing required token in header, or token is invalid"
        });
      }
    });
  } else {
    cb(400, { Error: "Missing required fields" });
  }
};

/* handlers._menu_items.post = (data, cb) => {
  const email =
    typeof data.payload.email === "string" &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;
  const shopping_list =
    data.payload.shopping_list instanceof Array &&
    data.payload.shopping_list.length > 0
      ? data.payload.shopping_list
      : false;

  if (email && shopping_list) {
    const token =
      typeof data.header.tokens === "string" ? data.headers.token : false;

    handlers._tokens.verifyToken(token, email, tokenIsValid => {
      if (tokenIsValid) {
        fs.readFile(`${dataBaseDir}/users/${email}.json`, 'utf-8', (err, userData) => {
          if (!err && userData) {
            
          } else {
            cb(400, {Error: 'Could not find the specified user'})
          }
        })
      } else {
        cb(403, {
          Error: "Missing required token in header, or token is invalid"
        });
      }
    });
  } else {
    cb(400, { Error: "Missing required fields" });
  }
}; */

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
      ? data.payload.email.trim()
      : false;

  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (email && password) {
    fs.readFile(
      `${dataBaseDir}/users/${email}.json`,
      "utf-8",
      (err, userData) => {
        if (!err && userData) {
          const parsedData = helpers.parseJsonToObject(userData);
          const hashedPassword = helpers.hash(password);
          if (hashedPassword === parsedData.hashedPassword) {
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
            cb(400, { Error: "Incorrect password" });
          }
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

handlers._tokens.delete = (data, cb) => {
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
          fs.unlink(`${dataBaseDir}/tokens/${id}.json`, err => {
            if (!err) {
              cb(200);
            } else {
              cb(500, { Error: "Could not remove token file" });
            }
          });
        } else {
          cb(400, { Error: "Could not find the specified token" });
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
