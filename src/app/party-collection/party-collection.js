import define from '../../../node_modules/backed/src/utils/define';
import RenderMixin from '../../../node_modules/custom-renderer-mixin/src/render-mixin.js';
import { analyze } from '../../../node_modules/web-audio-beat-detector/build/es2015/module.js';

import { read, write } from '../../utils/app.js';
import './collection-item.js';
import './collection-explorer';
import '../party-playlist.js';

export default define(class PartyCollection extends RenderMixin(HTMLElement) {
  get config() {
    return window.party.config;
  }

  get collection() {
    return window.party.collection;
  }

  get selector() {
    return this.shadowRoot.querySelector('custom-selector');
  }

  get explorer() {
    return this.shadowRoot.querySelector('collection-explorer');
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'})
    this.que = [];
    this.audioContext = new AudioContext();

    this._onSelected = this._onSelected.bind(this);
  }

  connectedCallback() {
    (async () => {
      if (super.connectedCallback) super.connectedCallback();
      if (Object.keys(this.collection).length > 0) this.stampCollection();

      this.watcher = new Worker('workers/watcher.js');
      this.watcher.onmessage = message => {
        if (this.needsUpdate(message.data)) this.prepare(message.data);
      }
      const ignore = Object.keys(this.collection).map(i => {return i});
      window.watcher = this.watcher
      this.watcher.postMessage({paths: this.config.paths, ignore: ignore});
    })();
    this.updateSongQues = this.updateSongQues.bind(this)
    this.selector.addEventListener('selected', this._onSelected);
    document.addEventListener('save-ques', this.updateSongQues)
  }

  _onSelected({detail}) {
    this.explorer.select(detail);
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
    for (const path of Object.keys(this.collection)) {
      this.collection[path].path = path;
      this.updateCollection(this.collection[path])
    }
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
        this.queRunning = false;
        try {
          if (!message.data.song.bpm) {
            const audioBuffer = await this.decode(message.data.arrayBuffer);
            const bpm = await analyze(audioBuffer);
            message.data.song.bpm = Math.round(bpm);
            this.collectionWorker.postMessage(message.data.song)
            return;
          } else {
            message.data.song.bpm = Math.round((message.data.song.bpm * 100)) / 100;
          }
        } catch (e) {
          message.data.song.bpm = 0;
        }
          this.updateCollection(message.data.song);
        // }
          const index = que.indexOf(last);
          que.splice(index, 1);
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
          overflow: hidden;
        }

        .row {
          display: flex;
          flex-direction: row;
        }

        .column {
          display: flex;
          flex-direction: column;
        }

        .tabs {
          position: absolute;
          left: 0;
          width: var(--party-playlist-width);
          height: 40px;

          background: #777;

          border-right: 1px solid #fff;
          border-left: 1px solid #fff;
        }

        :host([mode="studio"]) {
          top: 0;
          bottom: none;
        }

        :host([mode="studio"]) party-playlist, :host([mode="studio"]) .tabs {
          position: absolute;
          right: 0;
          width: calc(100% - var(--party-playlist-studio-width));
        }

        :host([mode="studio"]) .tabs {
          position: absolute;
          right: 0;
          left: auto;
          border-right: none;
          border-left: 1px solid #fff;
          width: var(--party-playlist-studio-width);
        }

        :host([mode="studio"]) party-playlist {
          top: 40px;
          height: calc(100% - 40px);
        }

        :host([mode="studio"]) collection-explorer {
          position: absolute;
          left: 0;
          width: calc(100% - var(--party-playlist-studio-width));
        }

        .list {
          overflow: auto;
          height: calc(100% - 40px);
          box-sizing:border-box;
          padding: 0 24px 8px 14px;
        }

        h4 {
          margin: 0;
          padding: 0;
          min-width: 120px;
          max-width: 240px;
          overflow: hidden;
          width: 100%;
        }

        .last {
          min-width: 32px;
          width: 32px;
        }

        .info {
          align-items: flex-end;
          background: #777;

          height: 40px;

          background: #777;
          border-bottom: 1px solid #fff;
          box-sizing: border-box;
          padding: 0 38px 8px 14px;

          /* border-right: 1px solid #fff;
          border-left: 1px solid #fff; */

        }

        .flex {
          flex: 1;
        }
        .flex2 {
          flex: 2;
        }

        party-button {
          width: 100%;
        }
      </style>


      <span class="column">
        <custom-selector class="tabs row" selected="music" attr-for-selected="data-route">
          <party-button data-route="music">Music</party-button>
          <party-button data-route="effects">Effects</party-button>
          <span class="flex"></span>
        </custom-selector>
        <party-playlist></party-playlist>
      </span>

      <collection-explorer>
        <span class="row info">
          <h4>artist</h4>
          <span class="flex"></span>
          <h4>title</h4>
          <span class="flex2"></span>
          <h4>genre</h4>
          <span class="flex2"></span>
          <h4 class="last">bpm</h4>
        </span>
        <span class="list">
          <slot></slot>
        </span>
      </collection-explorer>
    `;
  }

})
