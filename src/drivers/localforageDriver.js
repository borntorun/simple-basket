/**
 * localforageDriver.js
 * localforage (https://github.com/mozilla/localForage) driver for use with
 *  storage plugin wrapper (https://github.com/borntorun/simple-basket/blob/master/src/plugin-wrapper/storage.js) to use with
 *    simplebasket (https://github.com/borntorun/simple-basket)
 */
(function( global, factory ) {
  'use strict';
  if ( typeof define === 'function' && define.amd ) {
    define(['localforage', 'sessionStorageWrapper'], function( localforage, sessionStorageWrapper ) {
      factory(localforage, sessionStorageWrapper);
    });
  }
  else if ( typeof exports === 'object' ) {
    module.exports = factory(require('localforage'), require('sessionStorageWrapper'));
  }
  else {
    global.localforageDriver = factory(global.localforage, global.sessionStorageWrapper);
  }
})(this, function( localforage, sessionStorageWrapper ) {
  'use strict';

  var STORAGEWRAPPERS = {
    'localstorage': {name: localforage.LOCALSTORAGE},
    'indexeddb': { name: localforage.INDEXEDDB },
    'websql': { name: localforage.WEBSQL},
    'sessionstorage': { name: 'sessionStorageWrapper', driver: sessionStorageWrapper }
  };

  var ERRORS = {
    INVALIDSTATE: new Error('Storage driver config is in invalid state.'),
    CONFIGALREADYCALLED: new Error('Config already called.'),
    DRIVERINVALID: new Error('Driver is invalid.[#]'),
    DRIVERNOTDEFINED: new Error('Driver is not defined.[#]')
  };

  /**
   * Factory constructer for an localforageDriver
   * @constructor
   */
  function LocalforageDriverFactory() {

    /**
     * Create an instance of localforageDriver
     * @param wrapperStorage
     * @param opt
     */
    function create( wrapperStorage, opt ) {
      var driver = new LocalforageDriver();
      if ( wrapperStorage ) {
        return driver.config(wrapperStorage, opt);
      }
      return new Promise(function( resolve ) {
        resolve(driver);
      });
    }

    this.create = create;
  }

  /**
   * LocalforageDriver
   * @constructor
   */
  function LocalforageDriver() {
    var localForageInstance,
      configOk = false,
      configCalled = false,
      options = {};

    var _thislocalforageDriver = this;

    localForageInstance = localforage.createInstance();

    this.name = 'localforageDriver';

    this.config = config;

    this.load = load;

    this.save = save;

    this.clear = clear;

    this.getOptions = function() {
      return options;
    };

    /**
     * Config the driver
     * @param wrapperStorage
     * @param opt
     */
    function config( wrapperStorage, opt ) {
      /**
       * setOption
       * @param key
       * @param type
       * @param defaultValue
       */
      function setOption( key, type, defaultValue ) {
        if ( typeof opt[key] === type ) {
          options[key] = opt[key];
        }
        else if ( defaultValue !== undefined ) {
          options[key] = defaultValue;
        }
        //typeof opt[key] === type && (options[key] = opt[key]) || (defaultValue !== undefined && (options[key] = defaultValue));
      }

      var wrapper = STORAGEWRAPPERS[wrapperStorage];

      var thePromise = new Promise(function( resolve, reject ) {

        if ( configCalled ) {
          reject(ERRORS.CONFIGALREADYCALLED);
          return;
        }
        if ( !wrapper ) {
          reject(ERRORS.DRIVERINVALID.replace('#', wrapperStorage));
          return;
        }

        configCalled = true;

        opt = isHashObject(opt) ? opt : {};

        setOption('name', 'string', 'app-localforageDriver');
        setOption('storeName', 'string', 'store');
        setOption('description', 'string', '');
        setOption('size', 'number');
        setOption('key', 'string', 'key');

        Object.keys(options).length > 0 && (localForageInstance.config(options));

        if ( hasProp(wrapper, 'driver') ) {
          if ( !wrapper.driver ) {
            reject(ERRORS.DRIVERNOTDEFINED.replace('#', wrapper.name));
            return;
          }
          //custom driver first define it
          localForageInstance.defineDriver(wrapper.driver)
            .then(function() {
              //then set it
              setDriver(wrapper.name);
            })
            .catch(function( error ) {
              //or reject the config promise
              reject(error);
            });
        }
        else {
          //just set it
          setDriver(wrapper.name);
        }

        /**
         * Set localforage driver
         * @param driver
         */
        function setDriver( driver ) {
          localForageInstance.setDriver(driver)
            .then(function() {
              options.driver = wrapper.name;
              configOk = true;
              //resolve the config promise after set it
              resolve(_thislocalforageDriver);
            })
            .catch(function( error ) {
              //reject the config promise if not set
              reject(error);
            });
        }

      });
      return thePromise;
    }

    /**
     * Load from storage
     * @param callback
     */
    function load( callback ) {
      var thePromise = new Promise(function( resolve, reject ) {

        if ( !configOk ) {
          reject(ERRORS.INVALIDSTATE);
          return;
        }

        localForageInstance.ready()
          .then(function() {
            return localForageInstance.getItem(options.key);
          })
          .then(function( data ) {
            resolve(data);
          })
          .catch(function( error ) {
            reject(error);
          });
      });

      callCallback(thePromise, callback);
      return thePromise;

    }

    /**
     * Save to the storage
     * @param value
     * @param callback
     */
    function save( value, callback ) {
      var thePromise = new Promise(function( resolve, reject ) {

        if ( !configOk ) {
          reject(ERRORS.INVALIDSTATE);
          return;
        }

        localForageInstance.ready()
          .then(function() {
            return localForageInstance.setItem(options.key, value);
          })
          .then(function( data ) {
            resolve(data);
          })
          .catch(function( error ) {
            reject(error);
          });
      });

      callCallback(thePromise, callback);
      return thePromise;

    }

    /**
     * Remove from storage
     * @param callback
     */
    function clear( callback ) {
      var thePromise = new Promise(function( resolve, reject ) {

        if ( !configOk ) {
          reject(ERRORS.INVALIDSTATE);
          return;
        }

        localForageInstance.ready()
          .then(function() {
            return localForageInstance.removeItem(options.key);
          })
          .then(function( data ) {
            resolve(data);
          })
          .catch(function( error ) {
            reject(error);
          });
      });

      callCallback(thePromise, callback);
      return thePromise;
    }

    function callCallback( promise, callback ) {
      //call function callback on promise resolve/reject
      if ( callback ) {
        promise.then(function( data ) {
          callback(null, data);
        }, function( err ) {
          callback(err);
        });
      }
    }

    ///utilities
    function hasProp( obj, key ) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }

    function isHashObject( obj ) {
      var v = {};
      return (!!obj && typeof obj === 'object' && (obj.constructor === undefined || obj.constructor === v.constructor));
    }
  }

  LocalforageDriverFactory.prototype.STORAGE = {
    LOCALSTORAGE: 'localstorage',
    SESSIONSTORAGE: 'sessionstorage',
    INDEXEDDB: 'indexeddb',
    WEBSQL: 'websql'
  };
  return new LocalforageDriverFactory();
});
