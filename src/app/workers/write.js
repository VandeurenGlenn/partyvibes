'use strict';
import {join} from 'path';
import { bufferToArrayBuffer, write } from '../../utils/index.js';

onmessage = async ({data}) => {
  console.log(join(__dirname, data.path));
  try {
    await write(join(__dirname, data.path), data.data);
    postMessage('succes');
  } catch (error) {
    postMessage({error: error.code})
  }
};
