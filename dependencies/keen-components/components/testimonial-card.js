import { KeenElement } from '../dependencies/keen-element.js';

class TestimonialCard extends KeenElement {
  constructor() {
    super();

    if (this.hasAttribute('name')) {
      const testimonialName = this.getAttribute('name');
      this.retrieve('#testimonial-name').textContent = testimonialName;
    }

    if (this.hasAttribute('company')) {
      const company = this.getAttribute('company');
      this.retrieve('#testimonial-company').textContent = company;
    }

    if (this.hasAttribute('image')) {
      const imageSrc = this.getAttribute('image');
      const imageElement = document.createElement('img');

      imageElement.setAttribute('src', imageSrc);
      imageElement.setAttribute('height', 50);
      imageElement.setAttribute('width', 50);

      const testimonialInfo = this.retrieve('#testimonial-info');
      testimonialInfo.insertBefore(imageElement, testimonialInfo.firstChild);
    }
  }

  template() {
    return `
    <blockquote><slot></slot></blockquote>
    <div id="testimonial-info">
      <div>
        <h5 id="testimonial-name"></h5>
        <p id="testimonial-company"></p>
      </div>
    </div>`;
  }

  styles() {
    return `
    :host {
      display: inline-block;
      border-radius: 4px;
      font-size: 16px;
      font-weight: normal;
      text-align: left;
      line-height: 1.5;
      box-shadow: 0 0 13px 0 rgba(82, 63, 105, 0.1);
      background-color: #fff;
    }

    blockquote {
      font-style: normal;
      padding: 33px;
      margin: 0;
    }

    #testimonial-info {
      display: flex;
      flex-wrap: nowrap;
      padding: 0 33px 33px 33px;
    }

    img {
      display: inline-block;
      box-shadow: 0px 10px 16px 0px rgba(0,0,0,0.13);
      border-radius: 25px;
      max-width: 50px;
      max-height: 50px;
      margin-right: 16px;
    }

    #testimonial-name {
      font-size: 18px;
      font-weight: bold;
    }

    #testimonial-company {
      color: #77838f;
      font-size: 14px;
    }

    #testimonial-name,
    #testimonial-company {
      margin: 0;
    }`;
  }

}

customElements.define('testimonial-card', TestimonialCard);
