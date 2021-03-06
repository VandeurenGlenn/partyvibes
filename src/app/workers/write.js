'use strict';
import { join } from 'path';
import { bufferToArrayBuffer, write } from '../../utils/worker.js';

/**
 * Write to fs, by default writes to the app directory, set data.absolutePath to ignore.
 */
onmessage = async ({data}) => {
  try {
    await write(data.path, data.data);
    postMessage('succes');
  } catch (error) {
    postMessage({error: error.code})
  }
};
