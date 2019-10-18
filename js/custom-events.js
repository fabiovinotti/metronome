export const CustomEvents = (function() {

  const events = {}; // {eventType: [listener, ...], ... }

  function dispatch( eventType, ...args ) {

    if ( typeof eventType !== 'string' || !events[eventType] ) {
      return;
    }

    const listeners = events[eventType];
    for ( let listener of listeners ) {
      listener( ...args );
    }

  }

  function on( eventType, listener, context = null ) {

    if ( typeof listener !== 'function' || typeof eventType !== 'string' ) {
      return;
    }

    if ( !events.hasOwnProperty( eventType ) ) {
      events[eventType] = [];
    }

    let fn;
    if ( context ) {
      fn = listener.bind( context );
    } else {
      fn = listener;
    }

    events[eventType].push( fn );

  }

  return {
    dispatch,
    on
  };

})();
