import '../../../node_modules/custom-pages/src/custom-pages.js';
import '../../../node_modules/custom-selector/src/index.js';

export const template = html`
  <style>
    :host {
      display: flex;
      flex-direction: row;
      height: 100%;
      width: 100%;
    }

    .column {
      display: flex;
      flex-direction: column;
    }

    .tabs {
      display: flex;
      flex-direction: row;
      width: 100%;
      height: 40px;

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
      min-height: 38px;
    }

    section {
      box-sizing: border-box;
      padding: 4px 10px;
      overflow-y: auto;
    }
  </style>



  <span class="column main">

    <custom-selector class="tabs" selected="music" attr-for-selected="data-route">
      <party-button data-route="music">Music</party-button>
      <party-button data-route="effects">Effects</party-button>
      <span class="flex"></span>
    </custom-selector>

    <custom-pages selected="music" attr-for-selected="data-route">
      <section data-route="music"><slot></slot></section>
    </custom-pages>
  </span>
`;
