import { KeenElement, html } from '../dependencies/keen-element/index.js';

class NumberField extends KeenElement {
  constructor() {
    super();
    this._changeEvent = new Event('change', { 'bubbles': true, 'cancelable': false });
  }

  whenConnected() {
    /* Create control buttons*/
    if (this.hasAttribute('show-controls')) {
      /* Create decrease button */
      const decreaseButton = document.createElement('button');
      decreaseButton.setAttribute('id', 'decrease-button');
      decreaseButton.textContent = '−';
      this.shadowRoot.insertBefore(decreaseButton, this.shadowRoot.firstChild);

      /* Create increase button */
      const increaseButton = document.createElement('button');
      increaseButton.setAttribute('id', 'increase-button');
      increaseButton.textContent = '+';
      this.shadowRoot.appendChild(increaseButton);

      decreaseButton.addEventListener('mousedown', this._onmousedown_button.bind(this));
      increaseButton.addEventListener('mousedown', this._onmousedown_button.bind(this));
    }

    /* Set initial value */
    if (this.hasAttribute('value')) {
      this.value = this.getAttribute('value');
    }

    this.retrieve('input').addEventListener('change', this._onchange_input.bind(this));
  }

  _onchange_input() {
    const value = Number(this.value);
    const max = Number(this.max);
    const min = Number(this.min);

    if (value > max) {
      this.value = max;
    } else if (value < min) {
      this.value = min;
    }

    this.dispatchEvent(this._changeEvent);
  }

  _onmousedown_button(evt) {
    if (evt.button !== 0) return;

    const buttonId = evt.currentTarget.id;
    const step = Number(this.step) || 1;
    const value = Number(this.value);

    if (buttonId === 'decrease-button') {

      const newValue = value - step;
      if (!this.min || newValue >= this.min) {
        this.value = newValue;
        this.dispatchEvent(this._changeEvent);
      }

    } else {

      const newValue = value + step;
      if (!this.max || newValue <= this.max) {
        this.value = newValue;
        this.dispatchEvent(this._changeEvent);
      }

    }
  }

  get value() {
    return this.retrieve('input').value;
  }
  set value(value) {
    this.retrieve('input').value = value;
  }

  get step() {
    return this.getAttribute('step');
  }
  set step(value) {
    this.setAttribute('step', value);
  }

  get min() {
    return this.getAttribute('min');
  }
  set min(value) {
    this.setAttribute('min', value);
  }

  get max() {
    return this.getAttribute('max');
  }
  set max(value) {
    this.setAttribute('max', value);
  }

  template() { return html`<input type="number">`; }

  styles() {
    return `
    :host {
      width: 180px;
      display: flex;
      flex-wrap: no-wrap;
      align-item: center;
      user-select: none;
      background-color: #f3f5fe;
      border-radius: 5px;
      font-size: 16px;
      color: #4b5c7e;
      padding: 10px 20px;
      box-sizing: border-box;
    }

    button,
    input {
      text-align: center;
      border: 0;
      outline: none;
      background-color: transparent;
      font-family: inherit;
      font-size: inherit;
      color: inherit;
      padding: 0;
    }

    button,
    input::placeholder {

    }

    button {
      color: var(--buttons-color, #929292);
    }

    button:hover {
      color: var(--buttons-hover-color, #4b5c7e);
      cursor: pointer;
    }

    #decrease-button { margin-right: 20px; }
    #increase-button { margin-left: 20px; }

    input {
      width: 100%;
      -moz-appearance: textfield;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }`;
  }
}

customElements.define('number-field', NumberField);
