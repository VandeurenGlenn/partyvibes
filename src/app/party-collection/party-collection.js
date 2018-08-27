import define from '../../../node_modules/backed/src/utils/define';
import RenderMixin from '../../../node_modules/custom-renderer-mixin/src/render-mixin.js';
import { analyze } from '../../../node_modules/web-audio-beat-detector/build/es2015/module.js';

import './collection-item.js';
import './collection-explorer';

export default define(class PartyCollection extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    (async () => {
      if (super.connectedCallback) super.connectedCallback();

      try {
        this.config = await this.read('../../config.json');
      } catch (e) {
        this.config = {
          paths: []
        };
        await this.write('../../config.json', JSON.stringify(this.config));
        // return console.log('no config');
      }

      window.party.config = this.config;
      try {
        this.collection = await this.read('../../collection');
        this.stampCollection()
      } catch (e) {
        console.log(e);
        this.collection = {};
        await this.write('../../collection', JSON.stringify(this.collection));
      }
      this.watcher = new Worker('workers/watcher.js');
      this.watcher.onmessage = message => {
        if (this.needsUpdate(message.data)) this.prepare(message.data)
        console.log(message.data + ' added');
      }
      this.watcher.postMessage(this.config.paths);
      window.watcher = this.watcher
    })();
    this.updateSongQues = this.updateSongQues.bind(this)
    document.addEventListener('save-ques', this.updateSongQues)
  }

  /**
   * reads json
   */
  read(path) {
    return new Promise((resolve, reject) => {
      const worker = new Worker('workers/read.js');

      worker.onmessage = ({ data }) => {
        if (data.error) return reject(data.error);
        data = utils.arrayBufferToJSON(data);
        resolve(data);
      }

      worker.postMessage(path);
    });
  }

  write(path, data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker('workers/write.js');

      worker.onmessage = ({ data }) => {
        if (data.error) return reject(data.error);
        resolve();
      }

      worker.postMessage({ path, data });
    });
  }

  needsUpdate(path) {
    return !this.collection[path];
  }

  /**
   * decode arrayBuffer to audioBuffer
   */
  decode(buffer) {
    return new Promise((resolve, reject) => {
      const context = this.audioContext || new AudioContext();
      context.decodeAudioData(buffer, audioBuffer => resolve(audioBuffer))
    });
  }

  encode(audioBuffer) {
    return new Promise((resolve, reject) => {
      this.audioContext.encodeAudioData(audioBuffer, arrayBuffer => {
        resolve(arrayBuffer)
      })
    });
  }

  stampCollection() {
    Object.keys(this.collection).forEach(key => {
      this.collection[key].path = key;
      this.updateCollection(this.collection[key])
    })
  }

  updateCollection(song) {
    const el = document.createElement('collection-item');
    el.data = song;
    this.appendChild(el)
  }

  updateSongQues({detail}) {
    const {path, ques} = detail;
    this.collection[path].ques = ques;
    this.collectionWorker = this.collectionWorker || new Worker('workers/collection.js');
    this.collectionWorker.postMessage(this.collection[path])

  }

  updateSong({detail}) {
    // const {path, }
  }

  prepare(path) {
    this.collectionWorker = new Worker('workers/collection.js');
    // TODO: ignore path in chokidar
    this.collectionWorker.onmessage = async message => {
      if (message.data.status === 'updated') return this.updateCollection(message.data.song);
      // if (!message.arrayBuffer && !message.song message.data !== 'succes') return console.error(message);
      if (!message.data.song.bpm) {
        const audioBuffer = await this.decode(message.data.arrayBuffer);
        message.data.song.bpm = await analyze(audioBuffer);
        this.collectionWorker.postMessage(message.data.song)
        return;
      }
      this.updateCollection(message.data.song);
    }

    this.collectionWorker.postMessage(path)
  }

  get template() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: row;
          position: absolute;
          bottom: 0;
          right: 0;
          left: 0;
          height: 45%;

          border: 1px solid #FFF;
          background: #555;
        }
      </style>

      <collection-explorer>
        <slot></slot>
      </collection-explorer>
    `;
  }

})
