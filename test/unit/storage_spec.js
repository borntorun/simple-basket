describe('storage wrapper plugin', function() {
  'use strict';

  //Error mocha/phantomjs TypeError: JSON.stringify cannot serialize cyclic structures.
  //https://github.com/metaskills/mocha-phantomjs/issues/104
  var stringify = JSON.stringify;
  before(function() {
    JSON.stringify = function( obj ) {
      var seen = [];

      return stringify(obj, function( key, val ) {
        if ( typeof val === 'object' ) {
          if ( seen.indexOf(val) >= 0 ) {
            return;
          }
          seen.push(val);
        }
        return val;
      });
    };
  });
  after(function() {
    JSON.stringify = stringify;
  });

  var localforageDriver;
  var basket;

  beforeEach(function() {

    basket = window.simplebasket.create();

  });

  describe('#simplebasket==>', function() {
    it('should be extended with storage wrapper', function() {
      var oproto = Object.getPrototypeOf(basket);
      (Object.prototype.hasOwnProperty.call(oproto, 'ISTORAGE')).should.equal(true);
    });
  });

  describe('#simplebasket==>', function() {

    function doneTry( done, expectations ) {
      try {
        expectations();
        done();
      }
      catch( e ) {
        done(e);
      }
    }

    beforeEach(function( done ) {
      window.localforageDriver
        .create(window.localforageDriver.STORAGE.LOCALSTORAGE, {name: 'livraria', storeName: 'livros', key: 'basketshop'})
        .then(function( value ) {
          localforageDriver = value;

          basket = window.simplebasket.create();
          basket.implement(basket.ISTORAGE, localforageDriver);

          done();
        });

    });

    it('should save basket to storage', function( done ) {
      basket.add(1, 2, 3);
      basket.save()
        .then(function( data ) {
          doneTry(done, function() {
            (data[0]).should.equal(1);
            (data[1]).should.equal(2);
            (data[2]).should.equal(3);
          });
        })
        .catch(function( error ) {
          done(error);
        });
    });
    it('should load basket from storage', function( done ) {
      (basket.count()).should.equal(0);
      basket.load()
        .then(function() {
          doneTry(done, function() {
            (basket.count()).should.equal(3);
            var data = basket.getAll();
            (data[0]).should.equal(1);
            (data[1]).should.equal(2);
            (data[2]).should.equal(3);
          });
        })
        .catch(function( error ) {
          done(error);
        });
    });

    it('should clear basket from storage', function( done ) {
      (basket.count()).should.equal(0);

      basket.load()
        .then(function(){
          (basket.count()).should.equal(3);
          return basket.clear();
        })
        .then(function(){
          (basket.count()).should.equal(3);
          return basket.load();
        })
        .then(function() {
          doneTry(done, function() {
            (basket.count()).should.equal(0);//should be zero
          });
        })
        .catch(function( error ) {
          done(error);
        });
    });
  });
});
