import { KeenElement } from '../dependencies/keen-element.js';

class KeenButton extends KeenElement {
  constructor() {
    super();
    this._changeEvent = new Event('change', { 'bubbles': true, 'cancelable': false });
    this._touchStart = {}; // Coordinates pageX and pageY of touchstart event.
  }

  whenConnected() {
    if (this.hasAttribute('toggles')) {

      this.addEventListener('touchstart', this._onTouchStart);
      this.addEventListener('touchend', this._onTouchEnd);
      this.addEventListener('click', e => {
        if (e.button == 0)
          this._toggle();
      });
    }
  }

  _onTouchStart(e) {
    this._touchStart.x = e.changedTouches[0].pageX;
    this._touchStart.y = e.changedTouches[0].pageY;
  }

  _onTouchEnd(e) {
    const newTouchX = e.changedTouches[0].pageX;
    const newTouchY = e.changedTouches[0].pageY;

    if (Math.abs(newTouchX - this._touchStart.x) < 20 && Math.abs(newTouchY - this._touchStart.y) < 20)
      this._toggle();
    if (e.cancelable)
      e.preventDefault();
  }

  _toggle() {
    if (this.hasAttribute('active'))
      this.removeAttribute('active');
    else
      this.setAttribute('active', '');

    this.dispatchEvent(this._changeEvent);
  }

  template() {
    return '<slot>No content provided</slot>';
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
      -webkit-user-select: none;
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
