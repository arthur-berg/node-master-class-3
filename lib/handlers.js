const fs = require("fs");
const path = require("path");

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
  console.log("GET USER", data);
  cb(false);
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
    const id = helpers.createRandomString();

    const userData = {
      email,
      firstName,
      lastName,
      adress,
      id
    };

    fs.readFile(`${dataBaseDir}/users/${id}.json`, "utf8", err => {
      if (err) {
        console.log("continue and create user file");
        fs.open(
          `${dataBaseDir}/users/${id}.json`,
          "wx",
          (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
              const stringData = JSON.stringify(userData);
              console.log("stringData", stringData);
              fs.writeFile(
                `${dataBaseDir}/users/${id}.json`,
                stringData,
                err => {
                  if (!err) {
                    cb(false);
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

module.exports = handlers;
