
const templates = new Map();
const styleSheets = new Map();

export class KeenElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    if (templates.has(this.tagName)) {
      const template = templates.get(this.tagName);
      this.shadowRoot.appendChild(template.content.cloneNode(true));

    } else if (this.template) {
      const template = document.createElement('template');
      template.innerHTML = this.template();

      if (!document.adoptedStyleSheets && this.styles) {
        const styleElt = document.createElement('style');
        styleElt.innerHTML = this.styles();
        template.content.insertBefore(styleElt, template.content.firstChild);
      }

      templates.set(this.tagName, template);
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    if (document.adoptedStyleSheets) {
      if (styleSheets.has(this.tagName)) {
        const styleSheet = styleSheets.get(this.tagName);
        this.shadowRoot.adoptedStyleSheets = [styleSheet];

      } else if (this.styles) {
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(this.styles());
        styleSheets.set(this.tagName, styleSheet);
        this.shadowRoot.adoptedStyleSheets = [styleSheet];
      }
    }
  }

  connectedCallback() {
    if (this.isConnected && this.whenConnected) {
      this.whenConnected();
    }
  }

  retrieve(selector) {
    return this.shadowRoot.querySelector(selector);
  }

}
