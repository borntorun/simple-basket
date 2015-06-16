/*jshint -W098 */
(function( global, factory ) {
  'use strict';
  if ( typeof define === 'function' && define.amd ) {
    define('simplebasket', ['lodash'], function( _ ) {
      factory(_);
    });
  }
  else if ( typeof exports === 'object' ) {
    module.exports = factory(require('lodash'));
  }
  else {
    global.simplebasket = factory(global._);
  }
})(this, function( _ ) {
  'use strict';

  /**
   * Basket
   * @constructor
   */
  function Basket() {
    //basket items
    var items = [];

    /**
     * Adds one or more item to basket
     * @returns {*} returns the basket instance
     */
    this.add = function() {
      var _array;

      if ( arguments.length === 1 && isArray(arguments[0]) ) {
        _array = [].slice.call(arguments[0]);
      }
      else {
        _array = [].slice.call(arguments);
      }

      _array.forEach(function( item ) {
        items.push(item);
      });
      return this;
    };
    /**
     * Sets the basket cloning from an array of values
     * @param value array with values to set
     * @returns {*} returns the basket instance
     */
    this.set = function( value ) {
      if ( isArray(value) === false ) {
        return;
      }
      this.add.apply(this, _.clone(value, true));
      return this;
    };
    /**
     * Returns all items in basket
     * a clone (deep copy) of basket items is made
     * @returns {Array}
     */
    this.getClone = function( a ) {
      return _.clone(items, true);
    };
    /**
     * Return all items in basket
     * @returns {Array}
     */
    this.getAll = function() {
      return items;
    };
    /**
     * Remove am item by a reference key
     * @param key
     * @param value
     * @returns {Array}
     */
    this.remove = function( key, value ) {
      return _.remove(items, function( item ) {
        return item[key] && item[key] === value;
      });
    };
    /**
     * Remove one item by position
     * @param index position to remove
     * @returns {Array} with item removed
     */
    this.removeAt = function( index ) {
      //to not shift to last position when negative index
      index = index < 0 ? items.length : index;
      return _(items).splice(index, 1).value();
    };
    /**
     * Removes all items in the basket (Clear the basket)
     * @returns {*} returns the basket instance
     */
    this.removeAll = function() {
      items = [];
      return this;
    };
    /**
     * Iterate each item calling a function with its values
     * @param callback
     */
    this.iterate = function( callback ) {
      if ( {}.toString.call(callback) !== '[object Function]' ) {
        return;
      }
      _.forEach(items, callback, this);
    };
    /**
     * Returns the number of items in the basket
     * @returns {Number}
     */
    this.count = function() {
      return items.length;
    };
  }

  /////////////

//  function BasePluginWrapperInterface( type ) {
//    this.type = typeof type === 'string' ? type : '';
//  }
//
//  var noop = function() {
//  };
//  //holds plugin interfaces supportted
//  var pluginInterfaceType = {};
//
//  //holds plugin interfaces definition
//  var pluginInterfaceDefinition = {};
//
//  Basket.prototype.implements = function( oInterface, driver ) {
//
//    //test if is invalid interface
//    if ( !pluginInterfaceType[oInterface] ) {
//      return false;
//    }
//    //test if is invalid driver.name
//    if ( !(/^[a-zA-Z0-9_$]+$/).test(driver.name) ) {
//      return false;
//    }
//    //instance already implements interface
//    if ( this[oInterface] ) {
//      return false;
//    }
//    var Idefinition = pluginInterfaceDefinition[oInterface];
//
//    //verifies driver has keys from definition
//    for ( var key in Idefinition ) {
//      if ( hasProp(driver, key) === false ) {
//        return false;
//      }
//      if ( isFunction(Idefinition[key]) && isFunction(driver[key]) === false ) {
//        return false;
//      }
//    }
//    //set a key=interface type ex: instance.storage
//    //just for mark that the instance already implements the interface
//    this[oInterface] = driver;
//
//    var self = this;
//
//    function fcaller( f ) {
//      return function() {
//        //f is the prototype method for a key
//        //returns noop or the wrapper function for key
//        return f.call(self).apply(self, arguments);
//      };
//    }
//
//    //foreach method in plugin interface definition
//    //sets an instance method
//    for ( key in Idefinition ) {
//      if ( isFunction(Idefinition[key]) ) {
//        //get the prototype method for key
//        var f = Basket.prototype[key];
//        this[key] = fcaller(f);
//      }
//    }
//
//    return true;
//  };
//
//  function _extend( obj ) {
//
//    var funcWrapperKey = function( obj, key ) {
//      return function() {
//        if ( !hasProp(this, obj.type) ) {
//          return noop;
//        }
//        return obj[key];
//      };
//    };
//    for ( var key in obj ) {
//      if ( hasProp(obj, key) && isFunction(obj[key]) ) {
//        pluginInterfaceDefinition[obj.type][key] = noop;
//        Basket.prototype[key] = funcWrapperKey(obj, key);
//      }
//    }
//  }

  /////////////
  var objExports = {};

  Object.defineProperty(objExports, 'Basket', {
    get: function(){
      return Basket;
    }
  });

  objExports.create = function() {
    return new Basket();
  };
//  objExports.extend = function( obj ) {
//    if ( !(obj instanceof BasePluginWrapperInterface) ) {
//      return false;
//    }
//    if ( pluginInterfaceType[obj.type] ) {
//      return false;
//    }
//
//    for ( var key in obj ) {
//      if ( !hasProp(obj, key) || hasProp(Basket.prototype, key) ) {
//        return false;
//      }
//    }
//
//    pluginInterfaceType[obj.type] = obj.type;
//    pluginInterfaceDefinition[obj.type] = {name: 'string'};
//    Basket.prototype['I' + obj.type.toUpperCase()] = pluginInterfaceType[obj.type];
//    _extend(obj);
//
//    return true;
//  };
//  objExports.lose = function( name ) {
//    var obj = pluginInterfaceDefinition[name];
//    for ( var key in obj ) {
//      if ( hasProp(obj, key) && isFunction(obj[key]) && hasProp(Basket.prototype, key) ) {
//        delete Basket.prototype[key];
//      }
//    }
//    delete pluginInterfaceType[name];
//    delete Basket.prototype['I' + name.toUpperCase()];
//    delete pluginInterfaceDefinition[name];
//  };
//
//  objExports.getBasePluginWrapperInterface = function( name ) {
//    return new BasePluginWrapperInterface(name);
//  };
  return objExports;
//
//  function callCallback( promise, callback ) {
//    //call function callback on promise resolve/reject
//    if ( callback ) {
//      promise.then(function( data ) {
//        callback(null, data);
//      }, function( err ) {
//        callback(err);
//      });
//    }
//  }

//  function isFunction( obj ) {
//    return {}.toString.call(obj) === '[object Function]';
//  }

  function isArray( obj ) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

//  function hasProp( obj, key ) {
//    return Object.prototype.hasOwnProperty.call(obj, key);
//  }

});

