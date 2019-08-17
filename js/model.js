import { Model } from '../node_modules/baskel/baskel.js';

export const metronomeModel = new Model({

  data: {
    isPlaying: false,
    bpm: 120,
    timeSignature: [4,4],
    lastExecutionTime: 0,
    currentBeat: null,
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
  }

});
