import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';

import '../custom-select.js';

export default define(class PartySettings extends RenderMixin(HTMLElement) {

  constructor() {
    super();
    this.attachShadow({mode: 'open'})

    this._addFolder = this._addFolder.bind(this)
  }

  connectedCallback() {
    import(`./party-settings-template.js`).then(async ({ template }) => {
      this.template = template;
      if (super.connectedCallback) super.connectedCallback()

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audiooutput'); // && device.deviceId !== 'communications' );
      // await audio.setSinkId(audioDevices[0].deviceId);

      const selects = this.shadowRoot.querySelectorAll('custom-select')
      selects[0].items = audioDevices;
      selects[1].items = audioDevices

      this.shadowRoot.querySelector('.add').addEventListener('click', this._addFolder);
      // console.log('Audio is being played on ' + audio.sinkId);

      console.log(window.party.config);
    });
  }

  _addFolder() {
    const input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('multiple', '')

    input.setAttribute('directory', '')
    input.setAttribute('webkitdirectory', '')
    input.addEventListener('change', e => {
      window.party.config.paths.push(input.files[0].path);
      const writer = new Worker('workers/write.js')

      writer.postMessage({path: '../../config.json', data: JSON.stringify(window.party.config)})

      window.watcher.postMessage({add: true, paths: input.files[0].path});

    })
    input.click()
    // return Promise
  }

})
