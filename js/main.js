import { CustomEvents } from './custom-events.js';
import '../dependencies/keen-components/components/event-handler.js';
import '../dependencies/keen-components/components/keen-button.js';
import '../dependencies/keen-components/components/number-field.js';
import { store } from './store.js';

/*-- Cached Elements --*/
const baseElement = document.querySelector('#metronome');
const bpmDisplay = baseElement.querySelector('#bpm-display');
const bpmSelector = baseElement.querySelector('#bpm-selector');
const playButton = baseElement.querySelector('#play-button');

/*-- Data --*/
let isPlaying = false;
let bpm = 120;
let timeSignature = [4,4];
let lastExecutionTime = 0;
let currentBeat = null;

/*-- Computed Data --*/
function getBeatDuration() {
  return 60 / bpm;
}

function getNextExecutionTime() {
  return lastExecutionTime + getBeatDuration();
}

function getBeatsPerMeasure() {
  return timeSignature[0];
}

/*-- Event Listeners --*/
baseElement.addEventListeners({
  'mousedown .time-signature-button': evt => {
    const beatsPerMeasure = Number(evt.target.name[0]);
    const beatDuration = Number(evt.target.name[2]);
    const newTimeSignature = [beatsPerMeasure, beatDuration];

    if (timeSignature !== newTimeSignature) {
      timeSignature = newTimeSignature;
      if (currentBeat >= beatsPerMeasure) currentBeat = 0;
      renderBeatIndicatorsBox(getBeatsPerMeasure(), currentBeat);
      highlightTimeSignatureButton(timeSignature);
    }
  },

  'mousedown keen-button': evt => {
    if ( evt.button !== 0 ) return;
    isPlaying ? stopMetronome() : startMetronome();
  },

  'change #bpm-display': () => {
    bpm = Number(bpmDisplay.value);
    bpmSelector.value = bpmDisplay.value;
  },

  'change #bpm-selector': () => {
    bpm = Number(bpmSelector.value);
  },

  'input #bpm-selector': () => {
    bpmDisplay.value = bpmSelector.value;
  }
});

CustomEvents.on('beepPlayed', () => {
  const beatsPerMeasure = getBeatsPerMeasure();
  renderBeatIndicatorsBox(beatsPerMeasure, currentBeat);

  if (currentBeat + 1 < beatsPerMeasure) {
    currentBeat++;
  } else {
    currentBeat = 0;
  }

});

/*-- Functions --*/
function startMetronome() {
  isPlaying = true;
  lastExecutionTime = store.audioContext.currentTime - getBeatDuration();
  currentBeat = 0;
  checkIfTimeToSchedule();
}

function stopMetronome() {
  isPlaying = false;
}

function checkIfTimeToSchedule() {
  const nextExecutionTime = getNextExecutionTime();

  if (nextExecutionTime <= store.audioContext.currentTime + 0.100) {
    const hasToBeStressed = checkIfStressed();
    scheduleBeepExecution(nextExecutionTime, hasToBeStressed);
    lastExecutionTime = nextExecutionTime;
  }

  if (isPlaying) {
    setTimeout(checkIfTimeToSchedule.bind(this), 25);
  }
}

function checkIfStressed() {
  let hasToBeStressed;
  if (currentBeat === 0) {
    hasToBeStressed = true;
  }
  else {
    hasToBeStressed = false;
  }

  return hasToBeStressed;
}

function scheduleBeepExecution(executionTime, hasToBeStressed) {
  let frequency;

  if (hasToBeStressed) frequency = 1760;
  else frequency = 880;

  CustomEvents.dispatch( 'scheduledBeep', executionTime, frequency );
}

function renderBeatIndicatorsBox(howManyBeat, beatToHighlight) {
  const beatIndicatorsBox = document.createElement('div');
  beatIndicatorsBox.id = 'beat-indicators-box';

  for (let i = 0; i < howManyBeat; i++) {
    const beatIndicator = document.createElement('div');
    beatIndicator.className = 'beat-indicator';

    if (i === beatToHighlight) {
      beatIndicator.classList.add('highlighted');
    }

    beatIndicatorsBox.appendChild(beatIndicator);
  }

  baseElement.replaceChild(beatIndicatorsBox, baseElement.firstElementChild);
}

function highlightTimeSignatureButton(timeSignature) {
  const rightTimeSignature = timeSignature[0] + '-' + timeSignature[1];
  const timeSignatureButtons = baseElement.querySelector('#time-signature-buttons').children;

  for (let elt of timeSignatureButtons) {
    const button = elt.firstElementChild;
    if ( button.name === rightTimeSignature ) {
      button.classList.add( 'selected' );
    }
    else if ( button.classList.contains( 'selected' ) ) {
      button.classList.remove( 'selected' );
    }
  }
}

/* Initialize */
bpmDisplay.value = bpmSelector.value = bpm;
renderBeatIndicatorsBox(timeSignature[0]);
highlightTimeSignatureButton(timeSignature);
