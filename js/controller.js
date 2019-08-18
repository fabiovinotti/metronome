import { Controller, EventChannel } from '../node_modules/baskel/baskel.js';
import { store } from './store.js';
import { metronomeModel } from './model.js';
import { metronomeView } from './view.js';

const metronomeController = new Controller({

  model: metronomeModel,
  view: metronomeView,

  init: function() {
    // Notification Listeners
    EventChannel.subscribe( 'beepPlayed', () => {
      const beatsPerMeasure = this.model.beatsPerMeasure;
      const currentBeat = this.model.currentBeat;
      this.view.renderBeatIndicatorsBox( beatsPerMeasure, currentBeat );

      if ( this.model.currentBeat + 1 < this.model.beatsPerMeasure ) {
        this.model.currentBeat++;
      } else {
        this.model.currentBeat = 0;
      }

    }, this.view );

    // Initialize the view
    this.view.renderBeatIndicatorsBox( this.model.beatsPerMeasure );
    this.view.displayBpm( this.model.bpm );
    this.view.highlightTimeSignatureButton( this.model.timeSignature );
  },

  modelListeners: {

    'isPlaying': function() {
      this.model._isPlaying ? this.view.displayStopButton() : this.view.displayPlayButton();
    },

    'bpm': function() {
      this.view.displayBpm( this.model.bpm );
    },

    'timeSignature': function() {
      this.view.renderBeatIndicatorsBox( this.model.beatsPerMeasure, this.model.currentBeat );
      this.view.highlightTimeSignatureButton( this.model.timeSignature );
    }

  },

  viewListeners: {

    'mousedown #decrease-button': function( evt ) {
      if ( evt.button === 0 && this.model.bpm - 1 >= 10 ) {
        this.model.bpm--;
      }
    },

    'mousedown #increase-button': function ( evt ) {
      if (evt.button === 0 && this.model.bpm + 1 <= 250) {
        this.model.bpm++;
      }
    },

    'mousedown .time-signature-button': function( evt ) {
      const beatsPerMeasure = Number( evt.target.name[0] );
      const beatDuration = Number( evt.target.name[2] );
      const timeSignature = [beatsPerMeasure, beatDuration];

      if ( this.model.timeSignature !== timeSignature ) {
        this.model.timeSignature = timeSignature;
        if ( this.model.currentBeat >= beatsPerMeasure ) {
          this.model.currentBeat = 0;
        }
      }
    },

    'mousedown #play-button': function( evt ) {
      if ( evt.button != 0 ) {
        return;
      }
      this.model.isPlaying ? this.stopMetronome() : this.startMetronome();
    },

    'change #bpm-display': function () {
      const bpmDisplay = this.view.bpmDisplay;

      if ( bpmDisplay.value >= 10 && bpmDisplay.value <= 250 ) {
        this.model.bpm = bpmDisplay.value;
      }
      else if ( bpmDisplay.value < 10 ) {
        this.model.bpm = bpmDisplay.value = 10;
      }
      else if ( bpmDisplay.value > 250 ) {
        this.model.bpm = bpmDisplay.value = 250;
      }
    },

    'change #bpm-selector': function() {
      this.model.bpm = Number( this.view.bpmRangeSelector.value );
    },

    'input #bpm-selector': function() {
      this.view.displayBpm( this.view.bpmRangeSelector.value );
    }

  },

  methods: {

    startMetronome() {
      this.model.isPlaying = true;
      this.model.lastExecutionTime = store.audioContext.currentTime - this.model.BeatDuration;
      this.model.currentBeat = 0;
      this.checkIfTimeToSchedule();
    },

    stopMetronome() {
      this.model.emittedBeepCount = 0;
      this.model.isPlaying = false;
    },

    checkIfTimeToSchedule() {
      const nextExecutionTime = this.model.nextExecutionTime;

      if ( nextExecutionTime <= store.audioContext.currentTime + 0.100 ) {

        const hasToBeStressed = this.checkIfStressed();
        this.scheduleBeepExecution( nextExecutionTime, hasToBeStressed );
        this.model.lastExecutionTime = nextExecutionTime;

      }

      if ( this.model.isPlaying ) {
        setTimeout( this.checkIfTimeToSchedule.bind( this ), 25 );
      }

    },

    checkIfStressed() {

      let hasToBeStressed;
      if ( this.model.currentBeat === 0 ) {
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

      EventChannel.publish( 'scheduledBeep', executionTime, frequency );
    }

  }

});
