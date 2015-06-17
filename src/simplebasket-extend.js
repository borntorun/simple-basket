/**
 * simplebasket-extend.js
 * Allows simplebasket to accept plugins to extend itself
 */
/*jshint -W098 */
(function( global, factory ) {
  'use strict';
  if ( typeof define === 'function' && define.amd ) {
    define(['simplebasket'], function( simplebasket ) {
      return factory(simplebasket);
    });
  }
  else if ( typeof exports === 'object' ) {
    module.exports = factory(require('simplebasket'));
  }
  else {
    global.simplebasket = factory(global.simplebasket);
  }
})(this, function( simplebasket ) {
  'use strict';

  var Basket = simplebasket.Basket;

  var noop = function() {
  };

  function BasePluginWrapper( type ) {
    this.type = typeof type === 'string' ? type : '';
  }

  //holds plugin interfaces supportted
  var pluginInterfaceType = {};

  //holds plugin interfaces definition
  var pluginInterfaceDefinition = {};

  /**
   * Allows a Basket to implement a driver for the plugin-wrapper interface
   * @param wrapper - the plugin-wrapper pluged to simplebasket
   * @param driver - the implementation object
   * @returns {boolean}
   */
  Basket.prototype.implements = function( wrapper, driver ) {

    if ( this instanceof Basket === false ) {
      return false;
    }
    //test if is invalid interface
    if ( !pluginInterfaceType[wrapper] ) {
      return false;
    }
    //test if is invalid driver.name
    if ( !(/^[a-zA-Z0-9_$]+$/).test(driver.name) ) {
      return false;
    }
    //instance already implements interface
    if ( this[wrapper] ) {
      return false;
    }
    var Idefinition = pluginInterfaceDefinition[wrapper];

    //verifies driver has keys from definition
    for ( var key in Idefinition ) {
      if ( hasProp(driver, key) === false ) {
        return false;
      }
      if ( isFunction(Idefinition[key]) && isFunction(driver[key]) === false ) {
        return false;
      }
    }
    //set a key=interface type ex: instance.storage
    //just for mark that the instance already implements the interface
    this[wrapper] = driver;

    var self = this;

    function fcaller( f ) {
      return function() {
        //f is the prototype method for a key
        //returns noop or the wrapper function for key
        return f.call(self).apply(self, arguments);
      };
    }

    //foreach method in plugin interface definition
    //sets an instance method
    for ( key in Idefinition ) {
      if ( isFunction(Idefinition[key]) ) {
        //get the prototype method for key
        var f = Basket.prototype[key];
        this[key] = fcaller(f);
      }
    }

    return true;
  };

  function _extend( obj ) {

    var funcWrapperKey = function( obj, key ) {
      return function() {
        if ( !hasProp(this, obj.type) ) {
          return noop;
        }
        return obj[key];
      };
    };
    for ( var key in obj ) {
      if ( hasProp(obj, key) && isFunction(obj[key]) ) {
        pluginInterfaceDefinition[obj.type][key] = noop;
        Basket.prototype[key] = funcWrapperKey(obj, key);
      }
    }
  }

  /**
   * Plug a plugin-wrapper
   * @param obj a BasePluginWrapper to plug (see example: https://github.com/borntorun/simple-basket/blob/master/src/plugin-wrapper/storage.js)
   * @returns {boolean}
   */
  simplebasket.plug = function( obj ) {
    if ( !(obj instanceof BasePluginWrapper) ) {
      return false;
    }
    if ( pluginInterfaceType[obj.type] ) {
      return false;
    }

    for ( var key in obj ) {
      if ( !hasProp(obj, key) || hasProp(Basket.prototype, key) ) {
        return false;
      }
    }

    pluginInterfaceType[obj.type] = obj.type;
    pluginInterfaceDefinition[obj.type] = {name: 'string'};
    Basket.prototype['I' + obj.type.toUpperCase()] = pluginInterfaceType[obj.type];
    _extend(obj);

    return true;
  };
  /**
   * Remove a plugged object
   * @param name
   */
  simplebasket.lose = function( name ) {
    var obj = pluginInterfaceDefinition[name];
    for ( var key in obj ) {
      if ( hasProp(obj, key) && isFunction(obj[key]) && hasProp(Basket.prototype, key) ) {
        delete Basket.prototype[key];
      }
    }
    delete pluginInterfaceType[name];
    delete Basket.prototype['I' + name.toUpperCase()];
    delete pluginInterfaceDefinition[name];
  };
  /**
   * Get an instance for base plugin
   * @param name
   * @returns {BasePluginWrapper}
   */
  simplebasket.getBasePluginWrapper = function( name ) {
    return new BasePluginWrapper(name);
  };

  /////////////
  return simplebasket;

  function isFunction( obj ) {
    return {}.toString.call(obj) === '[object Function]';
  }

  function hasProp( obj, key ) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

});
