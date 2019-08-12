import { EventChannel } from './skeleton.js';
import { store } from './store.js';

export const beepGenerator = (function() {
  const context = store.audioContext;
  let oscillator;

  function init( frequency ) {
    oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.onended = () => EventChannel.publish( 'beepPlayed' );
    oscillator.connect( context.destination );
  }

  function play( when, frequency ) {
    init( frequency );
    oscillator.start( when );
    oscillator.stop( when + 0.1 );
  }

  return {
    play
  };

})();
EventChannel.subscribe( 'scheduledBeep', beepGenerator.play );
