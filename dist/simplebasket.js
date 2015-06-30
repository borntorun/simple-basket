/**
 * simplebasket.js
 * A simple javascript basket for values.
 * https://github.com/borntorun/simple-basket
 */
/*jshint -W098 */
(function( global, factory ) {
  'use strict';
  if ( typeof define === 'function' && define.amd ) {
    define(['_'], function( _ ) {
      return factory(_);
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

  //**********************************************************
  //Code taken from https://github.com/traviskaufman/cycloneJS
  var __call__ = Function.prototype.call;
  var _toString = _bind(__call__, {}.toString);
  var _hasOwn = _bind(__call__, {}.hasOwnProperty);

  // Many environments seem to not support ES5's native bind as of now.
  // Because of this, we'll use our own implementation.
  function _bind( fn, ctx ) {
    // Get a locally-scoped version of _slice here.
    var _slice = [].slice;
    // Like native bind, an arbitrary amount of arguments can be passed into
    // this function which will automatically be bound to it whenever it's
    // called.
    var boundArgs = _slice.call(arguments, 2);

    return function() {
      return fn.apply(ctx, boundArgs.concat(_slice.call(arguments)));
    };
  }

  //End: taken from https://github.com/traviskaufman/cycloneJS
  //**********************************************************

  var OPTIONS = {
    UNIQUEKEY: 'uniqueKey'
  };

  /**
   * Basket
   * @constructor
   */
  function Basket( opt ) {
    //basket items
    var items = [],
      options = opt || {};

    /**
     * Adds one or more item to basket
     * @param ...*
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

      var uniqueKey = options[OPTIONS.UNIQUEKEY];

      _array.forEach(function( item ) {
        if ( uniqueKey && typeof item === 'object' && _hasOwn(item, uniqueKey) ) {
          if ( this.find({key: uniqueKey, value: item[uniqueKey]}).length ) {
            return;
          }
        }
        items.push(item);
      }, this);
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
    this.getClone = function() {
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
     * Remove an item by a reference key
     * @param key
     * @param value
     * @returns {Array}
     */
    this.remove = function( key, value ) {
      //      return _.remove(items, function( item ) {
      //        return item[key] && item[key] === value;
      //      });
      var result = [],
        leng = items.length;
      for ( var i = 0; i < leng; ) {
        if ( items[i][key] && items[i][key] === value ) {
          result.push(items.splice(i, 1)[0]);
          leng--;
        }
        else {
          i++;
        }
      }
      return result;
    };
    /**
     * Remove one item by position
     * @param index position to remove
     * @returns {Array} with item removed
     */
    this.removeAt = function( index ) {
      //to not shift to last position when negative index
      index = index < 0 ? items.length : index;
      //return _(items).splice(index, 1).value();
      return items.splice(index, 1);//.value();
    };
    /**
     * Removes all items in the basket (Clear the basket)
     * @returns {*} returns the basket instance
     */
    this.removeAll = function() {
      //items = [];
      //seems this has better performance
      items.length = 0;
      return this;
    };
    /**
     * Iterate the basket calling a function for each item
     * @param callback
     */
    this.iterate = function( callback ) {
      if ( !isFunction(callback) ) {
        return;
      }
      //_.forEach(items, callback, this);

      var leng = items.length;
      for ( var i = 0; i < leng; i++ ) {
        callback.call(this, items[i], i, items);
      }

    };
    /**
     * Returns the number of items in the basket
     * @returns {Number}
     */
    this.count = function() {
      return items.length;
    };
    /**
     * Find values in basket and call callback with result values[] found
     * @param search
     * @param callback
     * @param callbackthis
     * @returns {Array}
     */
    this.find = function( search, callback, thisArg ) {
      var result = [];

      function _addIfequal( one, two, item ) {

        //http://stackoverflow.com/questions/10776600/testing-for-equality-of-regular-expressions
        function isRegexEqual( x, y ) {
          return (x instanceof RegExp) &&
            (y instanceof RegExp) &&
            (x.source === y.source) &&
            (x.global === y.global) &&
            (x.ignoreCase === y.ignoreCase) &&
            (x.multiline === y.multiline) &&
            (x.sticky === y.sticky);
        }

        var first = !!one ? one.valueOf() : one,
          second = !!two ? two.valueOf() : two;

        //removing support for RegExp for now (increasing performance...)
        //TODO: call isRegexEqual only when value to find is RegExp
        (/*isRegexEqual(one, two) || */first === second) && (result.push(item));
      }

      function _isTypeOk( value ) {
        var oType = _toString(value);
        //arrays and RegExp and Functions are not supported in find...
        return oType === '[object String]' ||
          oType === '[object Number]' ||
          oType === '[object Boolean]' ||
          oType === '[object Date]' ||
          oType === '[object Object]' ||
          //          oType === '[object RegExp]' ||
          oType === '[object Undefined]' ||
          oType === '[object Null]';
      }

      function _search() {
        var leng = items.length,
          isKeyValueSearch = (typeof search === 'object' && (!!search && _hasOwn(search, 'key'))),
          value;

        value = isKeyValueSearch === false ? search : search.value;

        if ( _isTypeOk(value) ) {
          for ( var i = 0; i < leng; i++ ) {
            var it = items[i], valueIn = items[i];
            if ( isKeyValueSearch ) {
              if ( !!it && _hasOwn(it, search.key) ) {
                valueIn = it[search.key];
                _addIfequal(valueIn, value, it);
              }
            }
            else {
              _addIfequal(valueIn, value, it);
            }
            //            if ( result.length ) {
            //              break;
            //            }
          }
        }
      }

      _search();

      if ( callback && isFunction(callback) ) {
        setTimeout(function() {
          callback.call(thisArg, result.length > 0 ? null : new Error('not found'), result);
        });
      }

      return result;
    };

    this.getOptions = function() {
      return options;
    };

  }


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
      if ( _hasOwn(driver, key) === false ) {
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
        if ( !_hasOwn(this, obj.type) ) {
          return noop;
        }
        return obj[key];
      };
    };
    for ( var key in obj ) {
      if ( _hasOwn(obj, key) && isFunction(obj[key]) ) {
        pluginInterfaceDefinition[obj.type][key] = noop;
        Basket.prototype[key] = funcWrapperKey(obj, key);
      }
    }
  }

  /////////////
  var objExports = {};

  Object.defineProperty(objExports, 'Basket', {
    get: function() {
      return Basket;
    }
  });

  /**
   * Create a Basket
   * @param options
   * @returns {Basket}
   */
  objExports.create = function( options ) {
    var opt;
    if ( !!options && _toString(options) === '[object Object]' && !!options[OPTIONS.UNIQUEKEY] && typeof options[OPTIONS.UNIQUEKEY] === 'string' ) {
      opt = {};
      opt[OPTIONS.UNIQUEKEY] = options[OPTIONS.UNIQUEKEY];
    }
    return new Basket(opt);
  };
  /**
   * Plug a plugin-wrapper
   * @param obj a BasePluginWrapper to plug (see example: https://github.com/borntorun/simple-basket/blob/master/src/plugin-wrapper/storage.js)
   * @returns {boolean}
   */
  objExports.plug = function( obj ) {
    if ( !(obj instanceof BasePluginWrapper) ) {
      return false;
    }
    if ( pluginInterfaceType[obj.type] ) {
      return false;
    }

    for ( var key in obj ) {
      if ( !_hasOwn(obj, key) || _hasOwn(Basket.prototype, key) ) {
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
  objExports.lose = function( name ) {
    var obj = pluginInterfaceDefinition[name];
    for ( var key in obj ) {
      if ( _hasOwn(obj, key) && isFunction(obj[key]) && _hasOwn(Basket.prototype, key) ) {
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
  objExports.getBasePluginWrapper = function( name ) {
    return new BasePluginWrapper(name);
  };
  return objExports;

  function isArray( obj ) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }
  function isFunction( obj ) {
    return {}.toString.call(obj) === '[object Function]';
  }
});




