import { KeenElement } from '../dependencies/keen-element.js';

class NumberField extends KeenElement {
  constructor() {
    super();
    this.step = 1;
    this._inputElement = this.shadowRoot.querySelector('input');
    this._inputEvent = new Event('input', { 'bubbles': true, 'cancelable': false });
    this._changeEvent = new Event('change', { 'bubbles': true, 'cancelable': false });
  }

  whenConnected() {
    if (this.hasAttribute('value')) {
      this.value = this.getAttribute('value');
    }

    if (this.hasAttribute('step')) {
      this.step = Number(this.getAttribute('step'));
    }

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

      decreaseButton.addEventListener('click', this._stepDown.bind(this));
      decreaseButton.addEventListener('touchstart', this._stepDown.bind(this));

      increaseButton.addEventListener('click', this._stepUp.bind(this));
      increaseButton.addEventListener('touchstart', this._stepUp.bind(this));
    }

    this._inputElement.addEventListener('change', this._onchange_input.bind(this));
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

  _stepDown(evt) {
    if (evt.type === 'click') {
      if (evt.button !== 0) return;
    } else if (evt.type === 'touchstart') {
      evt.preventDefault();
    }

    let newValue = this.value - this.step;
    if (this.min && newValue < this.min) {
      newValue = this.min;
    }

    if (this.value !== newValue) {
      this.value = newValue;
      this.dispatchEvent(this._inputEvent);
      this.dispatchEvent(this._changeEvent);
    }
  }

  _stepUp(evt) {
    if (evt.type === 'click') {
      if (evt.button !== 0) return;
    } else if (evt.type === 'touchstart') {
      evt.preventDefault();
    }

    let newValue = this.value + this.step;
    if (this.max && newValue > this.max) {
      newValue = this.max;
    }

    if (this.value !== newValue) {
      this.value = newValue;
      this.dispatchEvent(this._inputEvent);
      this.dispatchEvent(this._changeEvent);
    }
  }

  get value() {
    return Number(this._inputElement.value);
  }
  set value(value) {
    this._inputElement.value = value;
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

  template() { return '<input type="number">'; }

  styles() {
    return `
    :host {
      width: 180px;
      display: inline-flex;
      flex-wrap: no-wrap;
      align-items: stretch;
      justify-content: space-between;
      user-select: none;
      background-color: #ebedf2;
      border-radius: 5px;
      font-size: 16px;
      color: #4b5c7e;
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

    button {
      max-width: 65px;
      flex: 1;
      color: var(--buttons-color, #929292);
      cursor: pointer;
    }

    button:hover {
      color: var(--buttons-hover-color, #4b5c7e);
      cursor: pointer;
    }

    input {
      flex: 2;
      min-width: 0; // Check!!!!!!!!!
      -moz-appearance: textfield;
      padding: 10px;
    }

    :host([show-controls]) input {
      padding: 10px 0;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }`;
  }
}

customElements.define('number-field', NumberField);
