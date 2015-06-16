/*jshint -W098 */
(function( global, factory ) {
  'use strict';
  if ( typeof define === 'function' && define.amd ) {
    define('simplebasket-extend', ['simplebasket'], function( simplebasket ) {
      factory(simplebasket);
    });
  }
  else if ( typeof exports === 'object' ) {
    module.exports = factory(require('simplebasket'));
  }
  else {
    factory(global.simplebasket);
  }
})(this, function( simplebasket ) {
  'use strict';

  var Basket = simplebasket.Basket;

  var noop = function() {};

  function BasePluginWrapper( type ) {
    this.type = typeof type === 'string' ? type : '';
  }

  //holds plugin interfaces supportted
  var pluginInterfaceType = {};

  //holds plugin interfaces definition
  var pluginInterfaceDefinition = {};

  Basket.prototype.implements = function( oInterface, driver ) {

    if (this instanceof Basket === false) {
      return false;
    }
    //test if is invalid interface
    if ( !pluginInterfaceType[oInterface] ) {
      return false;
    }
    //test if is invalid driver.name
    if ( !(/^[a-zA-Z0-9_$]+$/).test(driver.name) ) {
      return false;
    }
    //instance already implements interface
    if ( this[oInterface] ) {
      return false;
    }
    var Idefinition = pluginInterfaceDefinition[oInterface];

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
    this[oInterface] = driver;

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
