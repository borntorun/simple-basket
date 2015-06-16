(function( global, factory ) {
  'use strict';
  if ( typeof define === 'function' && define.amd ) {
    define(['simplebasket-extend'], function( simplebasket ) {
      return factory(simplebasket);
    });
  }
  else if ( typeof exports === 'object' ) {
    module.exports = factory(require('simplebasket-extend'));
  }
  else {
    global.simplebasket = factory(global.simplebasket);
  }
})(this, function( simplebasket ) {
  'use strict';

  if(!simplebasket || !simplebasket.plug) {
    return;
  }

  var iObj = simplebasket.getBasePluginWrapper('storage');

  iObj.save = function( callback ) {
//    if ( !hasProp(this, iObj.type)) {
//      return;
//    }
    return this[iObj.type].save(this.getClone(), callback);
  };

  iObj.load = function( callback ) {
//    if ( !hasProp(this, iObj.type)) {
//      return;
//    }

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
//    if ( !hasProp(this, iObj.type) ) {
//      return;
//    }
    return this[iObj.type].clear(callback);
  };

  simplebasket.plug(iObj);

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

  return simplebasket;


});
