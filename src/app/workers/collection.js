import { parse, parseV2Tag } from 'id3-parser';
import { join } from 'path'
import { bufferToArrayBuffer, readOrCreate, read, write } from '../../utils/index.js';


// TODO: add option to optimize collection (when id3's are changed manual or something ...)
// TODO: add preset which sets cue at first peak/frequecy (bass/kick) and last

onmessage = async ({data}) => {
  let collection = await read(join(__dirname, '../../collection'));
  collection = JSON.parse(collection.toString());

  const updateCollection = (path, data) => collection[path] = data;

  const writeCollection = () => write(join(__dirname, '../../collection'), JSON.stringify(collection));

  // check if we are dealing with a file which has been procesd already.
  if (typeof data === 'object') {
    const path = data.path;
    delete data.path;
    updateCollection(path, data);
    await writeCollection();
    data = {
      status: 'updated',
      song: data
    }
    postMessage(data)
  } else { // handle as new file
    const buffer = await read(data);
    const { bpm, artist, title, year, image, track, setpart, genre } = parse(buffer);
    const arrayBuffer = bufferToArrayBuffer(buffer);


    const song = updateCollection(data, { bpm, artist, title, year, image, track, 'set-part': setpart, genre });;

    await writeCollection();

    song.path = data;
    postMessage({arrayBuffer, song});
  }

};
