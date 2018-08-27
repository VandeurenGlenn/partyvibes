'use strict';

var fs = require('fs');
var util = require('util');
var path = require('path');

/**
 * Read from local file system
 */
const read = util.promisify(fs.readFile);

/**
 * Write to local file system
 */
const write = util.promisify(fs.writeFile);

onmessage = async ({data}) => {
  console.log(path.join(__dirname, data.path));
  try {
    await write(path.join(__dirname, data.path), data.data);
    postMessage('succes');
  } catch (error) {
    postMessage({error: error.code});
  }
};
