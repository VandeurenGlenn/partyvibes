import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

export default define(class PartyEffects extends RenderMixin(HTMLElement) {
  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: row;
  }

  custom-selector {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
  }
</style>

<custom-selector>
  <party-button>filter</party-button>
  <party-button>echo</party-button>
  <party-button>trans</party-button>
  <party-button>skid</party-button>
  <party-button>hold</party-button>
  <party-button title="phaser">phase</party-button>
  <party-button title="flanger">flang</party-button>
  <party-button title="panner">pan</party-button>
  <party-button title="reverse">rev</party-button>
</custom-selector>
    `;
  }
})
