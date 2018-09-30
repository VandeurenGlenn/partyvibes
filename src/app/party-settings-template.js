export const template = html`
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background: #777;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .flex {
      flex: 1;
    }
    .button-holder {
      display: flex;
      align-items: center;
      min-width: 66px;
    }
    .button-holder.right {
      justify-content: flex-end;
    }

    custom-title-bar button {
      display: flex;
      align-items: center;
      background: transparent;
      height: 26px;
      border: none;
      border-right: 1px solid #eee;
      user-select: none;
      outline: none;
      cursor: pointer;
      color: #eee;
      padding: 4px 10px;
      box-sizing: border-box;
    }

    button[title="close"] {
      cursor: pointer;
      pointer-events: auto;

      border: none;
      border-left: 1px solid #eee;
    }

    .setting {
      padding: 24px 12px;
    }

    h4 {
      margin: 0;
      font-size: 30px;
    }

    h5 {
      margin: 0;
      font-size: 18px;
      padding-bottom: 24px;
    }

    h6 {
      font-size: 14px;
      margin: 0;
    }

    .padder {
      display: block;
      padding: 12px 0;
    }

    .padder2 {
      display: block;
      padding: 24px 0;
    }

    [disabled] {
      color: #eee;
      pointer-events: none;
    }
  </style>
  <custom-title-bar>
    <span class="button-holder" slot="left">
      <button title="back">&#129128;</button>
    </span>

    <span class="button-holder right" slot="right">
      <party-minimize-button></party-minimize-button>
      <party-quit-button></party-quit-button>
    </span>
  </custom-title-bar>
  <span class="setting">
    <h4 class="devices">Audio devices</h4>
    <h5>Device('s') to use</h5>
    <custom-select label="main" selected="Default">main</custom-select>

    <custom-select label="monitor" selected="Default">monitor</custom-select>
  </span>

  <span class="setting">
    <h4 class="libraries">libraries</h4>
    <span class="padder"></span>
    <h5>folders to scan for music</h5>
    <span>${'paths'}</span>
    <span class="padder"></span>
    <party-button class="add">add folder</party-button>
    <span class="padder2"></span>
    <h5 disabled>folders to scan for effects</h5>
    <span class="padder"></span>
    <party-button class="add-effects" disabled>add folder</party-button>
  </span>
`;
