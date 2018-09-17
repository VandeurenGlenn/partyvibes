import define from '../../../node_modules/backed/src/utils/define';
import RenderMixin from '../../../node_modules/custom-renderer-mixin/src/render-mixin.js';
import { analyze } from '../../../node_modules/web-audio-beat-detector/build/es2015/module.js';

import { read, write } from '../../utils/app.js';
import './collection-item.js';
import './collection-explorer';
import '../party-playlist.js';

export default define(class PartyCollection extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
    this.que = [];
    this.audioContext = new AudioContext();
  }

  connectedCallback() {
    (async () => {
      if (super.connectedCallback) super.connectedCallback();

      // try {
      //   this.config = await read('../../config.json');
      //   window.party.config = this.config;
      // } catch (e) {
      //   this.config = {
      //     paths: []
      //   };
      //   await write('../../config.json', JSON.stringify(this.config));
      //   // return console.log('no config');
      // }
      this.config = window.party.config
      console.log(this.config);
      try {
        this.collection = await read('../../collection');
        this.stampCollection()
      } catch (e) {
        console.log(e);
        this.collection = {};
        await write('../../collection', JSON.stringify(this.collection));
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
  //
  // /**
  //  * reads json
  //  */
  // read(path) {
  //   return new Promise((resolve, reject) => {
  //     const worker = new Worker('workers/read.js');
  //
  //     worker.onmessage = ({ data }) => {
  //       if (data.error) return reject(data.error);
  //       data = utils.arrayBufferToJSON(data);
  //       resolve(data);
  //     }
  //
  //     worker.postMessage(path);
  //   });
  // }
  //
  // write(path, data) {
  //   return new Promise((resolve, reject) => {
  //     const worker = new Worker('workers/write.js');
  //
  //     worker.onmessage = ({ data }) => {
  //       if (data.error) return reject(data.error);
  //       resolve();
  //     }
  //
  //     worker.postMessage({ path, data });
  //   });
  // }

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

  runQue(que) {
    const last = que[que.length - 1];
    if (!this.queRunning && last) {
      this.queRunning = true;
      this.collectionWorker = new Worker('workers/collection.js');
      // TODO: ignore path in chokidar
      this.collectionWorker.onmessage = async message => {
        console.log(que);
        this.queRunning = false;
        // if (message.data.status === 'updated') this.updateCollection(message.data.song);
        // else {
        try {
          if (!message.data.song.bpm) {
            const audioBuffer = await this.decode(message.data.arrayBuffer);
            const bpm = await analyze(audioBuffer);
            message.data.song.bpm = Math.round(bpm);
            this.collectionWorker.postMessage(message.data.song)
            return;
          } else {
            message.data.song.bpm = Math.round((bpm * 100)) / 100;
          }
        } catch (e) {
          message.data.song.bpm = 0;
        }
          this.updateCollection(message.data.song);
        // }
          const index = que.indexOf(last);
          que.splice(index, 1)
          console.log(que);
        if (this.que.length === 0) console.log('write');

        this.runQue(que);
        // if (!message.arrayBuffer && !message.song message.data !== 'succes') return console.error(message);

      }

      this.collectionWorker.postMessage(last)
    }
  }

  prepare(path) {
    this.que.push(path);
    this.runQue(this.que)
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
          height: 50%;

          border: 1px solid #FFF;
          background: #555;

          --party-playlist-width: 320px;
          --party-playlist-studio-width: 50%;
        }

        :host([mode="studio"]) {
          top: 0;
          bottom: none;
        }

        :host([mode="studio"]) party-playlist {
          position: absolute;
          right: 0;
          width: calc(100% - var(--party-playlist-studio-width));
        }

        :host([mode="studio"]) collection-explorer {
          position: absolute;
          left: 0;
          width: calc(100% - var(--party-playlist-studio-width));
        }
      </style>

      <party-playlist></party-playlist>

      <collection-explorer>
        <slot></slot>
      </collection-explorer>
    `;
  }

})
