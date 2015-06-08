/*jshint -W098 */
(function( global, factory ) {
  'use strict';
  if ( typeof define === 'function' && define.amd ) {
    define('localforageDriver', ['localforage', 'sessionStorageWrapper'], function( localforage, sessionStorageWrapper ) {
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
    INVALIDSTATE: new Error('Storage driver config is in invalid state.')
  };

  /**
   *
   * @constructor
   */
  function LocalforageDriverFactory() {

    /**
     *
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
   *
   * @constructor
   */
  function LocalforageDriver() {
    var localForageInstance,
      configOk = false,
      configCalled = false,
      options = {},
      driver;

    var self = this;

    localForageInstance = localforage.createInstance();

    this.name = 'localforageDriver';
    this.config = function( wrapperStorage, opt ) {
      /**
       *
       * @param key
       * @param type
       * @param defaultValue
       */
      function setOptions( key, type, defaultValue ) {
        typeof opt[key] === type && (options[key] = opt[key]) || (defaultValue !== undefined && (options[key] = defaultValue));
      }

      var wrapper = STORAGEWRAPPERS[wrapperStorage];

      var thePromise = new Promise(function( resolve, reject ) {

        if ( configCalled ) {
          reject(new Error('Config already called.'));
          return;
        }
        if ( !wrapper ) {
          reject(new Error('Driver is invalid.[' + wrapperStorage + ']'));
          return;
        }

        configCalled = true;

        opt = typeof opt === 'object' ? opt : {};

        setOptions('name', 'string', 'app-localforageDriver');
        setOptions('storeName', 'string', 'store');
        setOptions('description', 'string', '');
        setOptions('size', 'number');
        setOptions('key', 'string', 'key');

        Object.keys(options).length > 0 && (localForageInstance.config(options));

        function setDriver( driver ) {
          localForageInstance.setDriver(driver)
            .then(function() {
              options.driver = wrapper.name;
              configOk = true;
              //resolve the config promise after set it
              resolve(self);
            })
            .catch(function( error ) {
              //reject the config promise if not set
              reject(error);
            });
        }

        if ( wrapper.hasOwnProperty('driver') ) {
          if (!wrapper.driver) {
            reject(new Error('Driver is not defined.[' + wrapper.name + ']'));
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

      });
      return thePromise;
    };

    this.load = function() {
      var self = this;

      var thePromisse = new Promise(function( resolve, reject ) {

        if ( !configOk ) {
          reject(ERRORS.INVALIDSTATE/*new Error('Storage driver config is in invalid state.')*/);
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

      return thePromisse;

    };

    this.save = function( value ) {
      var thePromisse = new Promise(function( resolve, reject ) {

        if ( !configOk ) {
          reject(ERRORS.INVALIDSTATE/*new Error('Storage driver config is in invalid state.')*/);
          return;
        }

        localForageInstance.ready()
          .then(function() {
            //TODO:verifiy value vs form to get value of items to save this?.getClone
            //driver depends on simplebasket
            return localForageInstance.setItem(options.key, value);
          })
          .then(function( data ) {
            resolve(data);
          })
          .catch(function( error ) {
            reject(error);
          });
      });

      return thePromisse;

    };

    this.clear = function() {
      var self = this;

      var thePromisse = new Promise(function( resolve, reject ) {

        if ( !configOk ) {
          reject(ERRORS.INVALIDSTATE/*new Error('Storage driver config is in invalid state.')*/);
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

      return thePromisse;
    };

    ///utilities
    this.getOptions = function() {
      return options;
    };
  }

  LocalforageDriverFactory.prototype.STORAGE = {
    LOCALSTORAGE: 'localstorage',
    SESSIONSTORAGE: 'sessionstorage',
    INDEXEDDB: 'indexeddb',
    WEBSQL: 'websql'
  };
  return new LocalforageDriverFactory();
});
