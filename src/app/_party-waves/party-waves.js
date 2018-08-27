// import { analyze } from 'web-audio-beat-detector';
// import * as Peaks from '../node_modules/peaks.js/src/main.js';
import define from '../../node_modules/backed/src/utils/define';
import merge from '../../node_modules/backed/src/utils/merge';
import PropertyMixin from '../../node_modules/backed/src/mixins/property-mixin';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

import './party-button.js';
import './canvas-image.js';
import './party-tempo-slider.js';

export default define(class PartyWaves extends PropertyMixin(RenderMixin(HTMLElement)) {

  static get properties() {
    return merge(super.properties, {
      audioContext: {
        value: undefined
      }
    })
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    // this.peaks.on('peaks.ready');
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
  }

  get template() {
    return html`
<style>
  :host {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    pointer-events: auto;
  }

  .peaks-container {
    width: 100%;
    display: block;
  }
</style>

<canvas></canvas>
    `;
  }

  displayBuffer(buffer) {
   var leftChannel = buffer.getChannelData(0); // Float32Array describing left channel
   var lineOpacity = canvasWidth / leftChannel.length  ;
   context.save();
   context.fillStyle = '#222' ;
   context.fillRect(0,0,canvasWidth,canvasHeight );
   context.strokeStyle = '#121';
   context.globalCompositeOperation = 'lighter';
   context.translate(0,canvasHeight / 2);
   context.globalAlpha = 0.06 ; // lineOpacity ;
   for (var i=0; i<  leftChannel.length; i++) {
       // on which line do we get ?
       var x = Math.floor ( canvasWidth * i / leftChannel.length ) ;
       var y = leftChannel[i] * canvasHeight / 2 ;
       context.beginPath();
       context.moveTo( x  , 0 );
       context.lineTo( x+1, y );
       context.stroke();
   }
     context.restore();
     console.log('done');
  }
})
