import './collection-settings.js'
import '../../../node_modules/custom-pages/src/custom-pages.js';
import '../../../node_modules/custom-selector/src/index.js'
export const template = html`
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .drawer {
      display: flex;
      flex-direction: column;
      width: 256px;
      height: 100%;

      background: #777;

      border-right: 1px solid #fff;
    }

    custom-pages, .main {
      height: 100%;
      width: 100%;
    }

    party-button {
      width: 100%;
    }

    .flex {
      flex: 1;
    }

    section {
      display: flex;
      flex-direction: column;
    }

    custom-selector, party-button {
      pointer-events: auto;
      cursor: pointer;
    }

    span {
      pointer-events: none;
    }
    party-button {
      width: 100%;
    }

    section {
      box-sizing: border-box;
      padding: 4px 10px;
    }
  </style>

  <span class="row main">
    <custom-selector class="drawer" selected="music" attr-for-selected="data-route">
      <party-button data-route="music">Music</party-button>
      <party-button data-route="effects">Effects</party-button>
      <span class="flex"></span>
      <party-button data-route="settings">settings</party-button>
    </custom-selector>

    <custom-pages selected="music" attr-for-selected="data-route">
      <section data-route="music"><slot></slot></section>
      <collection-settings data-route="settings"></collection-settings>
    </custom-pages>
  </span>
`;
