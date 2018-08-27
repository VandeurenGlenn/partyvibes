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
    }

    main, .main {
      height: 100%;
      width: 100%;
    }

    .tabs {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      min-height: 56px;
      width: 100%;

      background: #888;
    }

    party-button {
      width: 100%;
    }

    .flex {
      flex: 1;
    }
  </style>

  <span class="setting">
    <h4 class="devices">Audio devices</h4>
    <h6>Device('s') to use</h6>
    <custom-select label="main" selected="Default">main</custom-select>

    <custom-select label="monitor" selected="Default">monitor</custom-select>
    <h4 class="libraries">libraries</h4>
    <h6>folders to scan for files</h6>



    <party-button class="add">add</party-button>
  </span>
`;
