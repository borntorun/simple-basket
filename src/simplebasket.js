/*jshint -W098 */
(function( global, factory ) {
  'use strict';
  if ( typeof define === 'function' && define.amd ) {
    define(['lodash'], function( _ ) {
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
  'use strict'

  function Basket() {
    //basket items
    var items = [];

    /**
     * Adds one or more item to basket
     * @returns {*} returns the basket instance
     */
    this.add = function() {
      var _array = [].slice.call(arguments);
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
      if ( Object.prototype.toString.call(value) !== '[object Array]' ) {
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
     * Clear the basket
     * @returns {*} returns the basket instance
     */
    this.clear = function() {
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

  return {
    create: function() {
      return new Basket();
    }
  };

});

