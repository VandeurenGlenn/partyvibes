/**
 * Spins up a worker and attempts to read file from local fs
 */
export const read = path => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('workers/read.js');

    worker.onmessage = ({ data }) => {

        // arrayBufferToString: buffer => String.fromCharCode.apply(null, new Uint8Array(buffer)),
        // arrayBufferToJSON: buffer => JSON.parse(window.utils.arrayBufferToString(buffer))
      if (data.error) return reject(data.error);
      data = utils.arrayBufferToJSON(data);
      console.log(data);
      resolve(data);
    }

    worker.postMessage(path);
  });
}

/**
 * Spins up a worker and attempts to write file to local fs
 */
export const write = (path, data) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('workers/write.js');

    worker.onmessage = ({ data }) => {
      if (data.error) return reject(data.error);
      resolve();
    }

    worker.postMessage({ path, data });
  });
}
