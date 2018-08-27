import { watch } from 'chokidar';
let watcher;
const isMusic = path => { if (path.includes('.mp3')) return true };

const newWatcher = paths => {
  watcher = watch(paths);

  watcher.on('add', path => { if (isMusic(path)) postMessage(path) });
}

onmessage = async message => {
  if (message.data.add)
    if (watcher === undefined) newWatcher(message.data.paths);
    else watcher.add(message.data.paths);

  else {
    try {
      if (watcher === undefined) newWatcher(message.data);
    } catch (error) {
      postMessage({error})
    }
  }
};
