'use strict';

var fs = require('fs');
var util = require('util');
var id3Parser = require('id3-parser');
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

// TODO: add option to optimize collection (when id3's are changed manual or something ...)
// TODO: add preset which sets cue at first peak/frequecy (bass/kick) and last

onmessage = async ({data}) => {
  let collection = await read(path.join(__dirname, '../../collection'));
  collection = JSON.parse(collection.toString());

  const updateCollection = (path$$1, data) => collection[path$$1] = data;

  const writeCollection = () => write(path.join(__dirname, '../../collection'), JSON.stringify(collection));

  // check if we are dealing with a file which has been procesd already.
  if (typeof data === 'object') {
    const path$$1 = data.path;
    delete data.path;
    updateCollection(path$$1, data);
    await writeCollection();
    data = {
      status: 'updated',
      song: data
    };
    postMessage(data);
  } else { // handle as new file
    const buffer = await read(data);
    const { bpm, artist, title, year, image, track, setpart, genre } = id3Parser.parse(buffer);
    const arrayBuffer = bufferToArrayBuffer(buffer);


    const song = updateCollection(data, { bpm, artist, title, year, image, track, 'set-part': setpart, genre });
    await writeCollection();

    song.path = data;
    postMessage({arrayBuffer, song});
  }

};
