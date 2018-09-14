'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var util = require('util');

/**
 * Read from local file system
 */
const read = util.promisify(fs.readFile);

/**
 * Write to local file system
 */
const write = util.promisify(fs.writeFile);

/**
 * Read file or create one when not existing
 */
const readOrCreate = async path => {
  try {
    const data = await read(path);
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') {
      await write(path, JSON.stringify({}));
      return {};
    }
    throw error
  }
};

/**
 * Convert buffer to arrayBuffer
 */
const bufferToArrayBuffer = buffer => {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const bufferView = new Uint8Array(arrayBuffer);
  for (var i=0, length=buffer.length; i < length; i++) {
    bufferView[i] = buffer[i];
  }
  return arrayBuffer;
};

exports.read = read;
exports.write = write;
exports.readOrCreate = readOrCreate;
exports.bufferToArrayBuffer = bufferToArrayBuffer;
