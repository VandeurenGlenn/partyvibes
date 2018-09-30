import define from '../../node_modules/backed/src/utils/define';

export default define(class PartyQuitButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `<style>
      :host {
        display: flex;
        cursor: pointer;
        border-left: 1px solid #eee;
        align-items: center;
        height: 26px;
        background: transparent;
        user-select: none;
        outline: none;
        color: #eee;
        padding: 4px 10px;
        box-sizing: border-box;
      }

      :host(.over) {
        background: #d76363;
      }
    </style>

    x`;

    this._mousein = this._mousein.bind(this);
    this._mouseout = this._mouseout.bind(this);
  }

  connectedCallback() {
    this.addEventListener('mouseover', this._mousein);
    this.addEventListener('mouseout', this._mouseout);
    this.addEventListener('click', () => window.dispatchEvent(new CustomEvent('quit')))
  }

  _mousein() {
    this.classList.add('over');
  }

  _mouseout() {
    this.classList.remove('over');
  }
})
