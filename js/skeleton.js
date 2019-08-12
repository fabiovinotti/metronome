/* Observer Pattern Implementation
------------------------------------------------------------------------------*/
export class Subject {
  constructor() {
    this.observers = [];
  }

  addObserver( observer ) {

    if ( !observer instanceof Observer || this.observers.includes( observer ) ) {
      return;
    }

    this.observers.push( observer );
  }

  notify( eventType, data ) {

    if ( typeof eventType !== 'string' ) {
      return;
    }

    for ( let observer of this.observers ) {
      observer.processNotification( eventType, data );
    }

  }
}


export class Observer {
  constructor() {
    this.events = {}; //{ eventType: callback, ... }
  }

  addListener( eventType, listener ) {

    if ( typeof eventType !== 'string' ) {
      return;
    }

    if ( typeof listener !== 'function' ) {
      return;
    }

    if ( this.events[eventType] ) {
      return;
    }

    this.events[eventType] = listener.bind( this );
  }

  processNotification( eventType, data = null ) {

    if ( this.events[eventType] ) {
      this.events[eventType]( data );
    }

  }
}

/* Model View Controller
------------------------------------------------------------------------------*/

/* Model
----------------------------------------*/
export class Model extends Subject {
  constructor( settings ) {
    super();

    if ( typeof settings !== 'object' ) {
      return;
    }

    if ( settings.hasOwnProperty( 'data' ) ) {
      for ( let prop in settings.data ) {

        Object.defineProperty( this, prop, {
          set( newValue ) {
            this[`_${prop}`] = newValue;
            this.notify( prop );
          },
          get() { return this[`_${prop}`]; }
        });

        this[`_${prop}`] = settings.data[prop];
      }
    }

    if ( settings.hasOwnProperty( 'getters' ) ) {
      for ( let getter in settings.getters ) {

        Object.defineProperty( this, getter, {
          get: settings.getters[getter]
        });

      }
    }

  }

}

/* View
----------------------------------------*/
export class View extends Subject {
  constructor( settings ) {
    super();

    if ( typeof settings === 'object' ) {

      if ( settings.hasOwnProperty( 'baseElement' ) ) {
        this.baseElement = document.querySelector( settings.baseElement ) || undefined;
      }

      if ( settings.hasOwnProperty( 'elements' ) ) {
        for ( let element in settings.elements ) {
          this.addElement( element, settings.elements[element] );
        }
      }

      if ( settings.hasOwnProperty( 'events' ) ) {
        this.events = settings.events;

        for ( let eventType in settings.events ) {
          this.baseElement.addEventListener( eventType, this.handleEvent.bind( this ) );
        }

      }

      if ( settings.hasOwnProperty( 'methods' ) ) {
        Object.assign( this, settings.methods );
      }

    }

  }

  addElement( elementName, selector ) {
    let retrievedElement;

    if ( selector[0] === '#' ) {
      retrievedElement = this.querySelector( selector );
    } else {
      retrievedElement = this.querySelectorAll( selector );
    }

    this[elementName] = retrievedElement;
  }

  handleEvent( evt ) {
    evt.stopPropagation();

    if ( evt.target === evt.currentTarget || !this.events.hasOwnProperty( evt.type ) ) {
      return;
    }

    const selectors = this.events[evt.type];
    const element = evt.target;

    for ( let selector of selectors ) {

      if ( element.matches( selector ) ) {

        let mainSelector;

        if ( selector.includes( ',' ) ) {
          const commaIndex = selector.indexOf( ',' );
          const firstSelector = selector.slice( 0, commaIndex );
          mainSelector = `view:${ firstSelector }:${ evt.type }`;
        } else {
          mainSelector = `view:${ selector }:${ evt.type }`;
        }

        this.notify( mainSelector, evt );
      }

    }

  }

  querySelector( selectors ) {
    return this.baseElement.querySelector( selectors );
  }

  querySelectorAll( selectors ) {
    return this.baseElement.querySelectorAll( selectors );
  }
}

/* Controller
----------------------------------------*/
export class Controller extends Observer {
  constructor( settings ) {
    super();

    if ( settings.hasOwnProperty( 'model' ) ) {
      this.model = settings.model;
      this.model.addObserver( this );
    }

    if ( settings.hasOwnProperty( 'view' ) ) {
      this.view = settings.view;
      this.view.addObserver( this );
    }

    if ( settings.hasOwnProperty( 'modelListeners' ) ) {

      for ( let listener in settings.modelListeners ) {
        this.addListener( listener, settings.modelListeners[listener] );
      }

    }

    if ( settings.hasOwnProperty( 'viewListeners' ) ) {

      for ( let listener in settings.viewListeners ) {
        const firstWhitespaceIndex = listener.search( /\s/ );
        const eventType = listener.slice( 0, firstWhitespaceIndex );
        const selector = listener.slice( firstWhitespaceIndex + 1 );
        this.addListener( `view:${ selector }:${ eventType }`, settings.viewListeners[listener] );
      }

      for ( let eventType in settings.viewListeners ) {
        for ( let selector in settings.viewListeners[eventType] ) {
          this.addListener( `view:${ selector.slice(0) }:${ eventType }`, settings.viewListeners[eventType][selector] );
          console.log(`view:${ selector }:${ eventType }`);
        }
      }

    }

    if ( settings.hasOwnProperty( 'methods' ) ) {
      Object.assign( this, settings.methods );
    }

    if ( settings.hasOwnProperty( 'init' ) && typeof settings.init === 'function' ) {
      settings.init.call( this );
    }

  }

}

/* Event Channel (Should it be a singleton?)
------------------------------------------------------------------------------*/
export const EventChannel = (function() {

  const topics = {}; // {topic: [subscriberCallback, ...], ... }

  function publish( topic, ...callbackArgs ) {

    if ( typeof topic !== 'string' || !topics[topic] ) {
      return;
    }

    const subscriberCallbacks = topics[topic];
    for ( let callback of subscriberCallbacks ) {
      callback( ...callbackArgs );
    }

  }

  function subscribe( topic, callback, context = null ) {

    if ( typeof callback !== 'function' || typeof topic !== 'string' ) {
      return;
    }

    if ( !topics.hasOwnProperty( topic ) ) {
      topics[topic] = [];
    }

    let fn;
    if ( context ) {
      fn = callback.bind( context );
    } else {
      fn = callback;
    }

    topics[topic].push( fn );

  }

  return {
    publish,
    subscribe
  };

})();
