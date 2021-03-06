/**
 * storage.js
 * storage plugin wrapper to use with
 *  simplebasket (https://github.com/borntorun/simple-basket)
 */
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
    factory(global.simplebasket);
  }
})(this, function( simplebasket ) {
  'use strict';

  if(!simplebasket || !simplebasket.plug) {
    return;
  }

  var iObj = simplebasket.getBasePluginWrapper('storage');

  iObj.save = function( callback ) {
    return this[iObj.type].save(this.getClone(), callback);
  };

  iObj.load = function( callback ) {
    var self = this;

    var thePromise = new Promise(function( resolve, reject ) {
      self[iObj.type].load()
        .then(function( data ) {
          self.removeAll();
          !!data && (self.add(data));
          resolve(self.getClone());
        })
        .catch(function( error ) {
          reject(error);
        });
    });
    callCallback(thePromise, callback);
    return thePromise;
  };

  iObj.clear = function( callback ) {
    return this[iObj.type].clear(callback);
  };

  simplebasket.plug(iObj);

  return simplebasket;

  //////////
  function callCallback( promise, callback ) {
    //call function callback on promise resolve/reject
    if ( isFunction(callback) ) {
      promise.then(function( data ) {
        callback(null, data);
      }, function( err ) {
        callback(err);
      });
    }
  }
  function isFunction( obj ) {
    return {}.toString.call(obj) === '[object Function]';
  }


});
