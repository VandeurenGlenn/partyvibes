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
  </style>
  <slot></slot>
`;
