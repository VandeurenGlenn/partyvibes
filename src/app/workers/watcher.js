import { watch } from 'chokidar';
let watcher;
const isMusic = path => { if (path.includes('.mp3') || path.includes('.wav')) return true };

const newWatcher = paths => {
  watcher = watch(paths);

  watcher.on('add', path => { if (isMusic(path)) postMessage(path) });
}

onmessage = async message => {
  if (message.data.add)
    if (watcher === undefined) newWatcher(message.data.paths, {ignored: message.data.ignore});
    else watcher.add(message.data.add);

  else {
    try {
      if (watcher === undefined) newWatcher(message.data.paths, {ignored: message.data.ignore});
    } catch (error) {
      postMessage({error})
    }
  }
};
