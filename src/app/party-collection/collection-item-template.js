export const template = html`
  <style>
    :host {
      display: flex;
      flex-direction: row;
      height: 30px;
      width: 100%;
      pointer-events: auto;
      user-select: none;
      cursor: pointer;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    ::slotted(.flex) {
      flex: 1;
    }

    ::slotted(.flex2) {
      flex: 2;
    }

    ::slotted(h4) {
      min-width: 120px;
      max-width: 240px;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
    ::slotted(.last) {
      min-width: 26px;
      width: 26px;
    }
  </style>
  <slot></slot>
`;
