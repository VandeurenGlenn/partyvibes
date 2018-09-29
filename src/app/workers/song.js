'use strict';
import { bufferToArrayBuffer, read } from '../../utils/worker.js';

onmessage = async ({data}) => {
  if (typeof data === 'string') {
    data = {
      dataUri: null,
      uri: data
    }
  }
  try {
    // try reading from song directory
    await read(data.dataUri)
  } catch (e) {
    data.dataUri = null;
  }
  const buffer = await read(data.uri);
  const arrayBuffer = bufferToArrayBuffer(buffer);
  postMessage({arrayBuffer, uri: data.uri, dataUri: data.dataUri});
};
