import { KeenElement, html } from '../dependencies/keen-element/index.js';

class KeenSlider extends KeenElement {
  constructor() {
    super();
    this._value = 0;
    this.min = 0;
    this.max = 100;
    this._manageUserInput = this._manageUserInput.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    /* Cached Elements */
    this._progressBar = this.shadowRoot.querySelector('#progress-bar');
    this._progressLine = this.shadowRoot.querySelector('#progress');
    this._knob = this.shadowRoot.querySelector('#knob');

  /* Events to emit */
    this._inputEvent = new Event('input', { 'bubbles': true, 'cancelable': false});
    this._changeEvent = new Event('change', { 'bubbles': true, 'cancelable': false });
  }

  whenConnected() {
    if (this.hasAttribute('value')) {
      this.value = Number(this.getAttribute('value'));
    }

    if (this.hasAttribute('min')) {
      this.min = Number(this.getAttribute('min'));
    }

    if (this.hasAttribute('max')) {
      this.max = Number(this.getAttribute('max'));
    }

    this.addEventListener('mousedown', evt => {
      if (evt.button !== 0) return;

      this._manageUserInput(evt);
      window.addEventListener('mousemove', this._manageUserInput);
      window.addEventListener('mouseup', this._onMouseUp);
    });

    this._displayProgress();
  }

  set value(newValue) {
    if (this._value === newValue) {
      return;
    } else if (newValue < this.min) {
      newValue = this.min;
    } else if (newValue > this.max) {
      newValue = this.max;
    }

    this._value = newValue;
    this._displayProgress();
  }
  get value() {
    return this._value;
  }

  _manageUserInput(evt) {
    const progressBarOffset = this._progressBar.getBoundingClientRect();
    const progressLineLength = this._computeProgressLineLenght(evt.clientX - 9, progressBarOffset.left, progressBarOffset.width - 18);

    this._value = this._computeValueByUi(progressLineLength, progressBarOffset.width - 18);

    /* Update the width of the progress line element */
    this._progressLine.style.width = `${progressLineLength}px`;
    this._knob.style.left = `${progressLineLength}px`;

    this.dispatchEvent(this._inputEvent);
  }

  _computeProgressLineLenght(mouseClientX, progressBarOffsetLeft, progressBarWidth) {
    let progressLineLength = mouseClientX - progressBarOffsetLeft;

    if (progressLineLength < 0) {
      progressLineLength = 0;
    } else if (progressLineLength > progressBarWidth) {
      progressLineLength = progressBarWidth;
    }

    return progressLineLength;
  }

  _computeValueByUi(progressLineLength, progressBarWidth) {
    const decimalPortion = progressLineLength / progressBarWidth;
    const newValue = decimalPortion * (this.max - this.min) + this.min;
    return Math.floor(newValue);
  }

  _onMouseUp() {
    window.removeEventListener('mousemove', this._manageUserInput);
    window.removeEventListener('mouseup', this._onMouseUp);
    this.dispatchEvent(this._changeEvent);
  }

  _displayProgress() {
    const decimalPortion = (this._value - this.min) / (this.max - this.min);
    const progressBarWidth = this._progressBar.getBoundingClientRect().width - 18;
    this._progressLine.style.width = `${progressBarWidth * decimalPortion}px`;
    this._knob.style.left = `${progressBarWidth * decimalPortion}px`;
  }

  template() {
    return html`
    <div id="progress-bar">
      <div id="progress"></div>
    </div>
    <div id="knob"></div>`;
  }

  styles() {
    return `
    :host {
      display: inline-block;
      width: 200px;
      position: relative;
      height: 18px;
      user-select: none;
    }

    #progress-bar,
    #progress {
      height: 4px;
    }

    #progress-bar {
      width: 100%;
      position: absolute;
      top: calc(50% - 2px);
      background-color: var(--progress-bar-color, #ebedf2);
      border-radius: 2px;
    }

    #progress {
      width: 0;
      background-color: var(--progress-color, #3699ff);
      border-radius: 2px 0 0 2px;
    }

    #knob {
      width: 18px;
      height: 18px;
      background-color: var(--slider-knob-color, #3699ff);
      border-radius: 100%;
      position: absolute;
      top: calc(50% - 9px);
      left: -9px;
    }`;
  }
}

customElements.define('keen-slider', KeenSlider);
