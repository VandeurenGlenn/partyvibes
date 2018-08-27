import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

/**
 * Read from local file system
 */
export const read = promisify(readFile);

/**
 * Write to local file system
 */
export const write = promisify(writeFile);

/**
 * Convert buffer to arrayBuffer
 */
export const bufferToArrayBuffer = buffer => {
  const arrayBuffer = new ArrayBuffer(buffer.length)
  const bufferView = new Uint8Array(arrayBuffer);
  for (var i=0, length=buffer.length; i < length; i++) {
    bufferView[i] = buffer[i];
  }
  return arrayBuffer;
}

export const readOrCreate = async path => {
  try {
    const data = await read(path);
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') {
      await write('collection', JSON.stringify({}));
      return {};
    }
    throw error
  }
}
