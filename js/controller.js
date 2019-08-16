import { Controller, EventChannel } from '../node_modules/baskel/baskel.js';
import { store } from './store.js';
import { metronomeModel } from './model.js';
import { metronomeView } from './view.js';

const metronomeController = new Controller({

  model: metronomeModel,
  view: metronomeView,

  init: function() {
    // Notification Listeners
    EventChannel.subscribe( 'beepPlayed', this.view.highlightNextBeatIndicator, this.view );

    // Initialize the view
    this.view.displayBeatIndicators( this.model.beatsPerMeasure );
    this.view.displayBpm( this.model.bpm );
    this.view.highlightTimeSignatureButton( this.model.timeSignature );
  },

  modelListeners: {

    'isPlaying': function() {
      this.model._isPlaying ? this.view.displayStopButton() : this.view.displayPlayButton();
    },

    'bpm': function() {
      this.view.displayBpm( this.model.bpm )
    },

    'timeSignature': function() {
      this.view.displayBeatIndicators( this.model.beatsPerMeasure );
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
      if ( this.model.isPlaying ) {
        this.stopMetronome();
      }

      const beatsPerMeasure = Number( evt.target.name[0] );
      const measureLength = Number( evt.target.name[2] );
      this.model.timeSignature = [beatsPerMeasure, measureLength];
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
      this.model.bpm = this.view.bpmRangeSelector.value;
    },

    'input #bpm-selector': function() {
      this.view.displayBpm( this.view.bpmRangeSelector.value );
    }

  },

  methods: {

    startMetronome() {
      this.model.isPlaying = true;
      this.model.lastExecutionTime = store.audioContext.currentTime - this.model.BeatDuration;
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
        this.model.emittedBeepCount++;

      }

      if ( this.model.isPlaying ) {
        setTimeout( this.checkIfTimeToSchedule.bind( this ), 25 );
      }

    },

    checkIfStressed() {

      let hasToBeStressed;
      if ( this.model.emittedBeepCount % this.model.beatsPerMeasure === 0 ) {
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
