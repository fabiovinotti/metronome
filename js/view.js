import { View } from '../node_modules/baskel/baskel.js';

export const metronomeView = new View({

  baseElement: '#metronome',

  elements: {

    beatIndicatorsBox: '#beat-indicators-box',
    bpmDisplay: '#bpm-display',
    bpmRangeSelector: '#bpm-selector',
    decreaseButton: '#metronome .decrease',
    increaseButton: '#metronome .increase',
    timeSignaturesBox: '#time-signatures',
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

    displayBeatIndicators( howManyBeat ) {
      const documentFragment = document.createDocumentFragment();

      while ( this.beatIndicatorsBox.firstChild ) {
        this.beatIndicatorsBox.removeChild( this.beatIndicatorsBox.firstChild );
      }

      for (let i = 0; i < howManyBeat; i++) {
        const beatIndicator = document.createElement('div');
        beatIndicator.className = 'beat-indicator';
        documentFragment.appendChild( beatIndicator );
      }

      this.beatIndicatorsBox.appendChild( documentFragment );

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
    },

    highlightNextBeatIndicator() {
      const beatIndicatorsBox = this.beatIndicatorsBox;
      const beatIndicators = Array.from( beatIndicatorsBox.querySelectorAll( '.beat-indicator' ) );
      const highlightedIndex = beatIndicators.findIndex( indicator => indicator.classList.contains( 'highlighted' ) );

      if ( highlightedIndex > -1 ) { // -1 = nothing found.
        let nextIndicator;
        beatIndicators[highlightedIndex].classList.remove( 'highlighted' );

        if ( highlightedIndex === beatIndicators.length - 1 ) {
          nextIndicator = beatIndicators[0];
        }
        else {
          nextIndicator = beatIndicators[highlightedIndex + 1];
        }

        nextIndicator.classList.add( 'highlighted' );

      } else {
        beatIndicators[0].classList.add( 'highlighted' );
      }

    },

    resetBeatIndicatorsColor() {
      const beatIndicatorsBox = this.beatIndicatorsBox;
      const beatIndicators = beatIndicatorsBox.querySelectorAll( '.beat-indicator' );
      for (let beatIndicator of beatIndicators) {
        if ( beatIndicator.classList.contains( 'highlighted' ) ) {
          beatIndicator.classList.remove( 'highlighted' );
        }
      }
    }

  }

});
