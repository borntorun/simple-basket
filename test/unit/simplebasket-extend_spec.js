describe('simplebasket-extend', function() {
  'use strict';
  var basket;

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

  function isFunction( obj ) {
    return {}.toString.call(obj) === '[object Function]';
  }

//  beforeEach(function() {
//    basket = window.simplebasket.create();
//  });

  describe('#plugins==>', function() {
    var called = false;

    beforeEach(function() {
      basket = window.simplebasket.create();
    });

    function Dummy() {
      this.name = 'dummy';
      this.dummyFunction = function() {
        called = true;
      };
    }
    function extendDummy(){
      var dummyWrapper = window.simplebasket.getBasePluginWrapper('dummy');
      dummyWrapper.dummyFunction = function() {
        this.dummy.dummyFunction();
      };
      return window.simplebasket.plug(dummyWrapper);
    }
    function loseDummy(){
      return window.simplebasket.lose('dummy');
    }

    it('should not allow extend with invalid interface', function() {
      function Dummy() {

      }
      var wrapperObj = new Dummy();

      (window.simplebasket.plug(wrapperObj)).should.equal(false);
    });
    it('should extend with plugin', function() {
      extendDummy();

      (basket.IDUMMY !== undefined).should.equal(true);
      (Object.prototype.hasOwnProperty.call(basket, 'dummyFunction')).should.equal(false);
      (basket.dummyFunction !== undefined).should.equal(true);
      (isFunction(basket.dummyFunction)).should.equal(true);

      basket.dummyFunction();
      (called).should.equal(false);

      var basket2 = window.simplebasket.create();
      basket2.dummyFunction();
      (called).should.equal(false);
    });
    it('should lose plugin', function() {
      loseDummy();

      (basket.IDUMMY !== undefined).should.equal(false);
      (basket.dummyFunction !== undefined).should.equal(false);
      (isFunction(basket.dummyFunction)).should.equal(false);

    });
    it('should allow implement after extend', function() {
      extendDummy();

      basket.implements(basket.IDUMMY, new Dummy());
      (Object.prototype.hasOwnProperty.call(basket, 'dummyFunction')).should.equal(true);
      basket.dummyFunction();
      (called).should.equal(true);

    });
    it('should not allow use if instance dows not implements', function() {
      called = false;
      var basket2 = window.simplebasket.create();
      (Object.prototype.hasOwnProperty.call(basket2, 'dummyFunction')).should.equal(false);
      basket2.dummyFunction();
      (called).should.equal(false);
    });
    it('should not allow new implementation after lose', function() {
      loseDummy();

      basket.implements(basket.IDUMMY, new Dummy());

      (Object.prototype.hasOwnProperty.call(basket, 'dummyFunction')).should.equal(false);

      (basket.dummyFunction===undefined).should.equal(true);

    });
    it('should not allow extend when already extended', function() {
      (extendDummy()).should.equal(true);

      (extendDummy()).should.equal(false);

    });
    it('should not implement when already implemented', function() {
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(false);
    });
    it('should allow implementation by diferent instances', function() {

      basket.implements(basket.IDUMMY, new Dummy());
      (Object.prototype.hasOwnProperty.call(basket, 'dummyFunction')).should.equal(true);
      basket.dummyFunction();
      (called).should.equal(true);

      called = false;

      var basket2 = window.simplebasket.create();
      basket2.implements(basket.IDUMMY, new Dummy());
      (Object.prototype.hasOwnProperty.call(basket2, 'dummyFunction')).should.equal(true);
      basket2.dummyFunction();
      (called).should.equal(true);

    });
    it('should maintain actual implementation by instance after lose', function() {
      basket.implements(basket.IDUMMY, new Dummy());
      (Object.prototype.hasOwnProperty.call(basket, 'dummyFunction')).should.equal(true);
      basket.dummyFunction();
      (called).should.equal(true);

      loseDummy();

      called = false;
      basket.dummyFunction();
      (called).should.equal(true);
    });

  });

  ////

  //  var localforageDriver;
  //  beforeEach(function( done ) {
  //
  //    window.localforageDriver.create(window.localforageDriver.STORAGE.LOCALSTORAGE,
  //      {name: 'livraria', storeName: 'livros', key: 'basketshop'})
  //      .then(function( value ) {
  //
  //        localforageDriver = value;
  //
  //        basket = window.simplebasket.create();
  //
  //        basket.implements(basket.ISTORAGE, localforageDriver);
  //
  //        done();
  //      });
  //
  //  });
  //  /*beforeEach(function() {
  //
  //    //basket.setDriver(basket.ISTORAGE, localforageDriver);
  //
  //  });*/

  //  xdescribe('#xxx==>', function() {
  //    xit('....', function( done ) {
  //
  //      basket.add('joao', 'maria', 'josé');
  //      basket.save()
  //        .then(function( data ) {
  //          console.log(data);
  //        });
  //      basket.add('isabel');
  //      var x;
  //      x = basket.save(function( err, data ) {
  //        console.log(data);
  //        console.log(x);
  //        done();
  //      }).then(function( data ) {
  //        console.log('then=', data);
  //      });
  //      console.log(x);
  //
  //    });
  //    it('load promise', function( done ) {
  //      console.log('basket 1=', basket.getAll());
  //      basket.load()
  //        .then(function( /*data*/ ) {
  //          console.log('load basket=', basket.getAll());
  //          done();
  //        })
  //        .catch(function( error ) {
  //          done(error);
  //        });
  //    });
  //    it('load callback', function( done ) {
  //      console.log('basket 1=', basket.getAll());
  //      basket.load(function( err/*, data*/ ) {
  //        if ( err ) {
  //          console.log('callback load error=', err);
  //        }
  //        else {
  //          console.log('callback load basket=', basket.getAll());
  //        }
  //        done();
  //      });
  //    });
  //    xit('delete promise', function( done ) {
  //      console.log('basket 1=', basket.getAll());
  //      basket.load()
  //        .then(function( data ) {
  //          console.log('load data 1=', data);
  //          console.log('load basket 1=', basket.getAll());
  //          return basket.clear();
  //        })
  //        .then(function( data ) {
  //          console.log('delete data=', data);
  //          return basket.load();
  //        })
  //        .then(function( data ) {
  //          console.log('load data 2=', data);
  //          console.log('load basket 2=', basket.getAll());
  //          done();
  //        })
  //        .catch(function( error ) {
  //          done(error);
  //        });
  //    });
  //
  //  });

});
