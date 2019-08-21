import { Component, CustomEvents } from '../node_modules/baskel/baskel.js';
import { store } from './store.js';

const metronome = new Component({
  data: {
    isPlaying: false,
    bpm: 120,
    timeSignature: [4,4],
    lastExecutionTime: 0,
    currentBeat: null
  },
  getters: {
    BeatDuration() {
      return 60 / this.bpm;
    },
    nextExecutionTime() {
      return this.lastExecutionTime + this.BeatDuration;
    },
    beatsPerMeasure() {
      return this.timeSignature[0];
    }
  },
  baseElement: '#metronome',
  elements: {
    bpmDisplay: '#bpm-display',
    bpmRangeSelector: '#bpm-selector',
    decreaseButton: '#decrease-button',
    increaseButton: '#increase-button',
    timeSignaturesBox: '#time-signature-buttons',
    playButton: '#play-button'
  },
  eventListeners: {
    'mousedown #decrease-button': function( evt ) {
      if ( evt.button === 0 && this.bpm - 1 >= 10 ) {
        this.bpm--;
        this.displayBpm( this.bpm );
      }
    },
    'mousedown #increase-button': function ( evt ) {
      if (evt.button === 0 && this.bpm + 1 <= 250) {
        this.bpm++;
        this.displayBpm( this.bpm );
      }
    },
    'mousedown .time-signature-button': function( evt ) {
      const beatsPerMeasure = Number( evt.target.name[0] );
      const beatDuration = Number( evt.target.name[2] );
      const timeSignature = [beatsPerMeasure, beatDuration];

      if ( this.timeSignature !== timeSignature ) {
        this.timeSignature = timeSignature;

        if ( this.currentBeat >= beatsPerMeasure ) {
          this.currentBeat = 0;
        }

        this.renderBeatIndicatorsBox( this.beatsPerMeasure, this.currentBeat );
        this.highlightTimeSignatureButton( this.timeSignature );
      }
    },
    'mousedown #play-button': function( evt ) {
      if ( evt.button !== 0 ) {
        return;
      }
      this.isPlaying ? this.stopMetronome() : this.startMetronome();
    },

    'change #bpm-display': function () {
      const bpmDisplay = this.bpmDisplay;

      if ( bpmDisplay.value >= 10 && bpmDisplay.value <= 250 ) {
        this.bpm = bpmDisplay.value;
      }
      else if ( bpmDisplay.value < 10 ) {
        this.bpm = bpmDisplay.value = 10;
      }
      else if ( bpmDisplay.value > 250 ) {
        this.bpm = bpmDisplay.value = 250;
      }

      this.displayBpm( this.bpm );
    },

    'change #bpm-selector': function() {
      this.bpm = Number( this.bpmRangeSelector.value );
      this.displayBpm( this.bpm );
    },

    'input #bpm-selector': function() {
      this.displayBpm( this.bpmRangeSelector.value );
    }
  },
  init: function() {
    CustomEvents.on( 'beepPlayed', () => {
      const beatsPerMeasure = this.beatsPerMeasure;
      const currentBeat = this.currentBeat;
      this.renderBeatIndicatorsBox( beatsPerMeasure, currentBeat );

      if ( this.currentBeat + 1 < this.beatsPerMeasure ) {
        this.currentBeat++;
      } else {
        this.currentBeat = 0;
      }

    });

    // Initialize the view
    this.renderBeatIndicatorsBox( this.beatsPerMeasure );
    this.displayBpm( this.bpm );
    this.highlightTimeSignatureButton( this.timeSignature );
  },
  methods: {
    startMetronome() {
      this.isPlaying = true;
      this.displayStopButton();
      this.lastExecutionTime = store.audioContext.currentTime - this.BeatDuration;
      this.currentBeat = 0;
      this.checkIfTimeToSchedule();
    },

    stopMetronome() {
      this.emittedBeepCount = 0;
      this.isPlaying = false;
      this.displayPlayButton();
    },

    checkIfTimeToSchedule() {
      const nextExecutionTime = this.nextExecutionTime;

      if ( nextExecutionTime <= store.audioContext.currentTime + 0.100 ) {

        const hasToBeStressed = this.checkIfStressed();
        this.scheduleBeepExecution( nextExecutionTime, hasToBeStressed );
        this.lastExecutionTime = nextExecutionTime;

      }

      if ( this.isPlaying ) {
        setTimeout( this.checkIfTimeToSchedule.bind( this ), 25 );
      }

    },

    checkIfStressed() {

      let hasToBeStressed;
      if ( this.currentBeat === 0 ) {
        hasToBeStressed = true;
      }
      else {
        hasToBeStressed = false;
      }

      return hasToBeStressed;
    },

    scheduleBeepExecution( executionTime, hasToBeStressed ) {
      let frequency;
      if ( hasToBeStressed ) {
        frequency = 1760;
      } else {
        frequency = 880;
      }

      CustomEvents.dispatch( 'scheduledBeep', executionTime, frequency );
    },

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
