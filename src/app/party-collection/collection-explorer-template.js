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

    custom-pages, .main {
      height: 100%;
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
      /* padding: 4px 10px; */
      overflow-y: auto;
    }
  </style>





    <custom-pages selected="music" attr-for-selected="data-route">
      <section data-route="music"><slot></slot></section>
    </custom-pages>

`;
