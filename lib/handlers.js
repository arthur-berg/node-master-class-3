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
  console.log("POST USER", data);
  cb(false);
};

module.exports = handlers;
