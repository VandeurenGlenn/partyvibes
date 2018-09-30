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
 * Read file or create one when not existing
 */
export const readOrCreate = async (path, _default) => {
  try {
    const data = await read(path);
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') {
      await write(path, _default);
      return _default;
    }
    throw error
  }
}

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
