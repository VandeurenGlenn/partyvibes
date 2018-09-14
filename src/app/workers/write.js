'use strict';
import { join } from 'path';
import { bufferToArrayBuffer, write } from '../../utils/worker.js';

onmessage = async ({data}) => {
  try {
    await write(join(__dirname, data.path), data.data);
    postMessage('succes');
  } catch (error) {
    postMessage({error: error.code})
  }
};
