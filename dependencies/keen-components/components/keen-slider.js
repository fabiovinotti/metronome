import { KeenElement } from '../dependencies/keen-element.js';

class KeenSlider extends KeenElement {
  constructor() {
    super();
    this._value = 0;
    this.min = 0;
    this.max = 100;
    this._onSliding = this._onSliding.bind(this);
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

    this.addEventListener('mousedown', this._onMouseDown);
    this.addEventListener('touchstart', this._onTouchStart);

    this._displayProgress();
  }

  _onMouseDown(evt) {
    if (evt.button !== 0) return;
    this._onSliding(evt);
    window.addEventListener('mousemove', this._onSliding);
    window.addEventListener('mouseup', this._onMouseUp);
  }

  _onMouseUp(evt) {
    if (evt.button !== 0) return;
    window.removeEventListener('mousemove', this._onSliding);
    window.removeEventListener('mouseup', this._onMouseUp);
    this.dispatchEvent(this._changeEvent);
  }

  _onTouchStart(evt) {
    this._onSliding(evt);
    this.addEventListener('touchmove', this._onSliding);
    this.addEventListener('touchend', this._onTouchEnd);
    evt.preventDefault();
  }

  _onTouchEnd() {
    this.removeEventListener('touchmove', this._onTouchMove);
    this.removeEventListener('touchend', this._onTouchEnd);
    this.dispatchEvent(this._changeEvent);
  }

  _onSliding(evt) {
    const progressBarOffset = this._progressBar.getBoundingClientRect();
    const progressMaxLenght = progressBarOffset.width - 9;
    let pointerClientX;

    if (evt.type === 'touchmove' || evt.type === 'touchstart') pointerClientX = evt.touches[0].clientX;
    else pointerClientX = evt.clientX;

    // Compute new progress length.
    let newProgressLength = Math.floor(pointerClientX - progressBarOffset.left);
    if (newProgressLength < 9) {
      newProgressLength = 9;
    } else if (newProgressLength > progressMaxLenght) {
      newProgressLength = progressMaxLenght;
    }

    /* Update Value */
    const decimalPortion = (newProgressLength - 9) / (progressMaxLenght - 9);
    this._value = Math.floor(decimalPortion * (this.max - this.min) + this.min);

    this._updateUIElementStyles(newProgressLength);
    this.dispatchEvent(this._inputEvent);
    if (evt.type === 'touchmove') evt.preventDefault();
  }

  _displayProgress() {
    const decimalPortion = (this._value - this.min) / (this.max - this.min);
    const progressMaxLenght = this._progressBar.getBoundingClientRect().width - 18;
    const newProgressLength = (progressMaxLenght * decimalPortion) + 9;
    this._updateUIElementStyles(newProgressLength);
  }

  _updateUIElementStyles(newProgressLength) {
    this._progressLine.style.width = newProgressLength + 'px';
    this._knob.style.transform = `translateX(${newProgressLength}px)`;
  }

  set value(newValue) {
    if (newValue === this._value) {
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

  template() {
    return `
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
      background-color: var(--slider-progress-color, #3699ff);
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
