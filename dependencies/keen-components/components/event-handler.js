import { KeenElement } from '../dependencies/keen-element.js';

class EventHandler extends HTMLElement {
  constructor() {
    super();
    this._events = {}; // { eventType: { selector: callback, ... }, ... }
  }

  addEventListeners(listeners) {
    for (let listenerName in listeners) {
      const firstWhitespaceIndex = listenerName.search( /\s/ );
      const eventType = listenerName.slice( 0, firstWhitespaceIndex );
      const selector = listenerName.slice( firstWhitespaceIndex + 1 );
      const listener = listeners[listenerName];
      this._addListener(eventType, selector, listener);
    }
  }

  _addListener(eventType, selector, listener) {
    if (!this._events[eventType]) {
      this._events[eventType] = {};
      this.addEventListener(eventType, this._handleEvent);
    }
    this._events[eventType][selector] = listener.bind(this);
  }

  _handleEvent(evt) {
    evt.stopPropagation();
    if (evt.target === evt.currentTarget || !this._events.hasOwnProperty(evt.type)) {
      return;
    }

    const selectors = this._events[evt.type];
    const targetElement = evt.target;

    for (let selector in selectors) {
      if (targetElement.matches(`${selector}, ${selector} *`)) {
        this._events[evt.type][selector](evt);
      }
    }
  }
}

customElements.define('event-handler', EventHandler);
