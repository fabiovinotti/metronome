import { html, KeenElement } from '../dependencies/keen-element/index.js';

class KeenButton extends KeenElement {
  constructor() {
    super();
  }

  whenConnected() {
    if (this.hasAttribute('toggles')) {
      this.addEventListener('mousedown', evt => {
        if (evt.button !== 0) return;

        if (this.hasAttribute('active')) {
          this.removeAttribute('active');
        } else {
          this.setAttribute('active', '');
        }
      });
    }
  }

  template() {
    return html`<slot>No content provided</slot>`;
  }

  styles() {
    return `
    :host {
      display: inline-block;
      overflow: hidden;
      outline: none;
      width: auto;
      background-color: var(--button-color, #3699ff);
      color: var(--button-text-color, #fff);
      padding: 12px 16px;
      border: 0;
      border-radius: 3.25px;
      text-decoration: none;
      font-size: 16px;
      font-weight: 400;
      line-height: 1;
      white-space: nowrap;
      position: relative;
      user-select: none;
      transition: all 0.2s ease-in-out;
    }

    :host(:hover) {
      cursor: pointer;
      box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 11px;
    }

    :host::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      background-color: #fff;
      transition: all 0.2s linear;
    }

    :host([active]) {
      background-color: #34ad58;
    }`;
  }
}

customElements.define('keen-button', KeenButton);
