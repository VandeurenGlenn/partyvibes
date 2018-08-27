'use strict';
import { bufferToArrayBuffer, read } from '../../utils/index.js';

onmessage = async message => {
  const buffer = await read(message.data);
  const arrayBuffer = bufferToArrayBuffer(buffer);
  postMessage({arrayBuffer, uri: message.data});
};
