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

onmessage = async message => {
  try {
    const buffer = await read(path.join(__dirname, message.data));
    const arrayBuffer = bufferToArrayBuffer(buffer);
    postMessage(arrayBuffer);
  } catch (error) {
    postMessage({error: error.code});
  }
};
