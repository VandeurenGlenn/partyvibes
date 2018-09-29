
// import * as Peaks from '../node_modules/peaks.js/src/main.js';
import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

import './party-button.js';
import './party-player.js';
import './party-tempo-slider.js';
import './party-ques';
import './party-effects';

export default define(class PartyTurntable extends RenderMixin(HTMLElement) {

  get tempoSlider() {
    return this.shadowRoot.querySelector('party-tempo-slider')
  }

  get player() {
    return this.shadowRoot.querySelector('party-player')
  }

  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    // this.peaks.on('peaks.ready');
  }

  connectedCallback() {
    // super.connectedCallback();
    if (super.connectedCallback) super.connectedCallback();
    // this.audioBuffer = this.audioContext.createBuffer();
    this.tempoSlider.addEventListener('change', ({ detail }) => {
      this.player.playbackRate = detail;
    });

    this.loop = {}

    this.play = this.play.bind(this);
    this.shadowRoot.querySelector('.play').addEventListener('click', this.play)

    this.shadowRoot.querySelector('.que').addEventListener('click', e => {
      this.player.que()
    })

    this.shadowRoot.querySelector('.loop-in').addEventListener('click', e => {
      this.loop.start = this.player.getCurrentTime()

      if (!this.player.source.playing) {
        this.player.play()
      }
    })

    this.shadowRoot.querySelector('.loop-out').addEventListener('click', e => {
      this.loop.end = this.player.getCurrentTime()
      this.player.pause()
      this.player.loop(this.loop)
    })

    this.shadowRoot.querySelector('.reloop').addEventListener('click', e => {
      this.loop.end = this.player.source.context.currentTime;
      this.player.loop(this.loop)
    })
  }

  play() {
    if (!this.playing) {
      // this.source.connect(this.audioContext.destination)
      // this.audioContext.createBufferSource()

      // console.log(this.source);
      this.player.play();
      // TODO: pitch
      // TODO: convert playbackRate to bpm
      this.playing = true;
    } else {
      this.player.pause()
      // TODO: get currenttime and temp save when paused
      this.playing = false;
    }
  }

  get template() {
    return html`
    <style>
    :host {
      display: flex;
      flex-direction: column !important;
      height: 100%;
      width: 100%;
      pointer-events: auto;
      background: #555;
      padding: 12px;
      box-sizing: border-box;
    }

    .column {
      display: flex;
      flex-direction: column;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .peaks-container {
      width: 100%;
      display: block;
    }
    .bottom {
      padding: 6px 24px 6px 0;
      box-sizing: border-box;
    }

    .flex {
      flex: 1;
    }

    .flex2 {
      flex: 2;
    }

    .que-item {
      display: flex;
      align-items: center;
      padding: 24px;
      box-sizing: border-box;
    }

    .center {
      align-items: center;
    }

    party-tempo-slider {
      padding-left: 12px;
    }

    .reloop {
      width: 67px;
    }

    .sized {
      padding-left: 12px;
    }
    </style>

    <span class="row">
      <span class="flex"></span>
      <span class="column top">
        <span class="row top">
          <span class="column top">
            <party-player></party-player>
            <party-effects></party-effects>
            <party-ques></party-ques>
          </span>
        </span>
        <span class="flex"></span>
      </span>
      <span class="flex"></span>
      <party-tempo-slider></party-tempo-slider>
    </span>

    <span class="flex"></span>

    <span class="row center">
      <party-button class="play">play</party-button>
      <party-button class="que">que</party-button>
      <span class="flex2"></span>
      <party-button class="loop-in">in</party-button>
      <party-button class="loop-out">out</party-button>
      <span class="sized"></span>
      <party-button class="reloop">reloop</party-button>
    </span>
    `

  }
})
