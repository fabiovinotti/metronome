import { View } from '../node_modules/baskel/baskel.js';

export const metronomeView = new View({

  baseElement: '#metronome',

  elements: {

    bpmDisplay: '#bpm-display',
    bpmRangeSelector: '#bpm-selector',
    decreaseButton: '#decrease-button',
    increaseButton: '#increase-button',
    timeSignaturesBox: '#time-signature-buttons',
    playButton: '#play-button'

  },

  events: {

    mousedown: [
      '#play-button, #play-button *',
      '#decrease-button, #decrease-button *',
      '#increase-button, #increase-button *',
      '.time-signature-button'
    ],
    input: ['#bpm-selector'],
    change: ['#bpm-selector', '#bpm-display']

  },

  methods: {

    displayBpm( bpm ) {
      this.bpmDisplay.value = this.bpmRangeSelector.value = bpm;
    },

    renderBeatIndicatorsBox( howManyBeat, beatToHighlight ) {

      const beatIndicatorsBox = document.createElement( 'div' );
      beatIndicatorsBox.id = 'beat-indicators-box';

      for ( let i = 0; i < howManyBeat; i++ ) {
        const beatIndicator = document.createElement( 'div' );
        beatIndicator.className = 'beat-indicator';

        if ( i === beatToHighlight ) {
          beatIndicator.classList.add( 'highlighted' );
        }

        beatIndicatorsBox.appendChild( beatIndicator );
      }

      this.querySelector( '#beat-indicators-box' ).remove();

      this.baseElement.insertBefore( beatIndicatorsBox, this.baseElement.firstChild );

    },

    highlightTimeSignatureButton( timeSignature ) {
      const rightTimeSignature = timeSignature[0] + '-' + timeSignature[1];
      const timeSignatureButtons = this.timeSignaturesBox.children;

      for (let elt of timeSignatureButtons) {
        const button = elt.firstElementChild;
        if ( button.name === rightTimeSignature ) {
          button.classList.add( 'selected' );
        }
        else if ( button.classList.contains( 'selected' ) ) {
          button.classList.remove( 'selected' );
        }
      }
    },

    displayPlayButton() {
      this.playButton.style.paddingLeft = '12px';
      this.playButton.innerHTML = '<i class="fas fa-play"></i>';
    },

    displayStopButton() {
      this.playButton.style.paddingLeft = '0';
      this.playButton.innerHTML = '<i class="fas fa-stop"></i>';
    }

  }

});
