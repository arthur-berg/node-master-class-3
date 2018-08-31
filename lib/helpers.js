const fs = require('fs');
const crypto = require('crypto');
const config = require('./config');
const path = require('path');
const helpers = {};

helpers.parseJsonToObject = str => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

helpers.createRandomString = strLength => {
  strLength = typeof strLength == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for (i = 1; i <= strLength; i++) {
      // Get a random charactert from the possibleCharacters string
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      // Append this character to the string
      str += randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

helpers.hash = str => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Get the string content of a template, and use provided data for string interpolation
helpers.getTemplate = (templateName, data, cb) => {
  templateName =
    typeof templateName === 'string' && templateName.length > 0
      ? templateName
      : false;
  data = typeof data === 'object' && data !== null ? data : {};
  if (templateName) {
    const templatesDir = path.join(__dirname, '/../templates/');
    fs.readFile(templatesDir + templateName + '.html', 'utf8', (err, str) => {
      if (!err && str && str.length > 0) {
        // Do interpolation on the string
        const finalString = helpers.interpolate(str, data);
        cb(false, finalString);
      } else {
        cb('No template could be found');
      }
    });
  } else {
    cb('A valid template name was not specified');
  }
};

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
helpers.addUniversalTemplates = (str, data, cb) => {
  str = typeof str === 'string' && str.length > 0 ? str : '';
  data = typeof data === 'object' && data !== null ? data : {};
  // Get the header
  helpers.getTemplate('_header', data, (err, headerString) => {
    if (!err && headerString) {
      // Get the footer
      helpers.getTemplate('_footer', data, (err, footerString) => {
        if (!err && headerString) {
          // Add them all together
          const fullString = headerString + str + footerString;
          cb(false, fullString);
        } else {
          cb('Could not find the footer template');
        }
      });
    } else {
      cb('Could not find the header template');
    }
  });
};

helpers.interpolate = function(str, data) {
  str = typeof str === 'string' && str.length > 0 ? str : '';
  data = typeof data === 'object' && data !== null ? data : {};

  for (let keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data['global.' + keyName] = config.templateGlobals[keyName];
    }
  }
  for (let key in data) {
    if (data.hasOwnProperty(key) && typeof data[key] === 'string') {
      const replace = data[key];
      const find = '{' + key + '}';
      str = str.replace(find, replace);
    }
  }
  return str;
};

helpers.getStaticAsset = (fileName, cb) => {
  fileName =
    typeof fileName === 'string' && fileName.length > 0 ? fileName : false;
  if (fileName) {
    const publicDir = path.join(__dirname, '/../public/');
    fs.readFile(publicDir + fileName, (err, data) => {
      if (!err && data) {
        cb(false, data);
      } else {
        cb('No file could be found');
      }
    });
  } else {
    cb('A valid file name was not specified');
  }
};
module.exports = helpers;
