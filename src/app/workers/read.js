'use strict';
import {join} from 'path';
import { bufferToArrayBuffer, read } from '../../utils/worker.js';

onmessage = async message => {
  try {
    const buffer = await read(message.data);
    const arrayBuffer = bufferToArrayBuffer(buffer);
    postMessage(arrayBuffer);
  } catch (error) {
    postMessage({error: error.code})
  }
};
