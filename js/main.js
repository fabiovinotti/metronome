import { CustomEvents } from './custom-events.js';
import '../dependencies/keen-components/components/event-handler.js';
import '../dependencies/keen-components/components/keen-button.js';
import '../dependencies/keen-components/components/number-field.js';
import '../dependencies/keen-components/components/keen-slider.js';
import { store } from './store.js';

/*-- Cached Elements --*/
const baseElement = document.querySelector('#metronome');
const bpmDisplay = baseElement.querySelector('#bpm-display');
const bpmSlider = baseElement.querySelector('#bpm-slider');
const playButton = baseElement.querySelector('#play-button');

/*-- Data --*/
let isPlaying = false;
let bpm = 120;
let timeSignature = [4,4];
let lastExecutionTime = 0;
let currentBeat = null;
let lastTap = null;
let tapTimeDistance = null;

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
  'click .time-signature-button': evt => {
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

  'mousedown #tap-button': e => {
    if (e.button == 0)
      reactToTap();
  },

  'touchstart #tap-button': e => {
    reactToTap();
    e.preventDefault();
  },

  'change #play-button': evt => {
    isPlaying ? stopMetronome() : startMetronome();
  },

  'change #bpm-display': () => {
    bpm = Number(bpmDisplay.value);
    bpmSlider.value = bpmDisplay.value;
  },

  'change #bpm-slider': () => {
    bpm = Number(bpmSlider.value);
  },

  'input #bpm-slider': () => {
    bpmDisplay.value = bpmSlider.value;
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
    setTimeout(checkIfTimeToSchedule, 25);
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

function reactToTap() {
  const now = store.audioContext.currentTime;

  if (lastTap && now - lastTap <= 6) {
    if (tapTimeDistance)
      tapTimeDistance = (tapTimeDistance + now - lastTap) / 2;
    else
      tapTimeDistance = now - lastTap;
    setBpm(60 / tapTimeDistance);
  }
  else
    tapTimeDistance = null;

  lastTap = now;
}

function setBpm(value) {
  if (value > 250)
    value = 250;
  bpm = Math.round(value);
  bpmSlider.value = bpmDisplay.value = bpm;
}

/* Initialize */
bpmDisplay.value = bpmSlider.value = bpm;
renderBeatIndicatorsBox(timeSignature[0]);
highlightTimeSignatureButton(timeSignature);
