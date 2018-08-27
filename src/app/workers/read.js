'use strict';
import {join} from 'path';
import { bufferToArrayBuffer, read } from '../../utils/index.js';

onmessage = async message => {
  try {
    const buffer = await read(join(__dirname, message.data));
    const arrayBuffer = bufferToArrayBuffer(buffer);
    postMessage(arrayBuffer);
  } catch (error) {
    postMessage({error: error.code})
  }
};
