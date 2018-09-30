import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';

import '../custom-select.js';

export default define(class PartySettings extends RenderMixin(HTMLElement) {

  constructor() {
    super();
    this.attachShadow({mode: 'open'})

    this._addFolder = this._addFolder.bind(this);
    this._back = this._back.bind(this);
  }

  connectedCallback() {
    import(`./party-settings-template.js`).then(async ({ template }) => {
      this.template = template;
      this.properties = {paths: window.party.config.paths.map(path => `<span class="path">${path}</span>`)}
      if (super.connectedCallback) super.connectedCallback()

      Object.defineProperty(this, 'paths', {
        set: value => {
          this.properties.paths = value.map(path => `<span class="path">${path}</span>`)
          this.render(this.properties)
        }
      })

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audiooutput'); // && device.deviceId !== 'communications' );
      // await audio.setSinkId(audioDevices[0].deviceId);

      const selects = this.shadowRoot.querySelectorAll('custom-select')
      selects[0].items = audioDevices;
      selects[1].items = audioDevices

      this.shadowRoot.querySelector('button[title="back"]').addEventListener('click', this._back);
      this.shadowRoot.querySelector('.add').addEventListener('click', this._addFolder);
      // console.log('Audio is being played on ' + audio.sinkId);
    });
  }

  _back() {
    document.dispatchEvent(new CustomEvent('back'))
  }

  _addFolder() {
    const input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('multiple', '')

    input.setAttribute('directory', '')
    input.setAttribute('webkitdirectory', '')
    input.addEventListener('change', e => {
      window.party.config.paths.push(input.files[0].path);
      window.party.saveConfig();
      this.paths = window.party.config.paths;
      window.watcher.postMessage({add: true, paths: input.files[0].path});

    })
    input.click()
    // return Promise
  }

})
