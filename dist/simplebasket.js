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

  /**
   * Basket
   * @constructor
   */
  function Basket() {
    //basket items
    var items = [];

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
      if ( {}.toString.call(callback) !== '[object Function]' ) {
        return;
      }
      //_.forEach(items, callback, this);

      var leng = items.length;
      for (var i = 0; i < leng; i++) {
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
  }

  /////////////
  var objExports = {};

  Object.defineProperty(objExports, 'Basket', {
    get: function() {
      return Basket;
    }
  });

  objExports.create = function() {
    return new Basket();
  };

  return objExports;

  function isArray( obj ) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

});




