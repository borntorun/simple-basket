describe('simplebasket-extend', function() {
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

  /*function isFunction( obj ) {
    return {}.toString.call(obj) === '[object Function]';
  }*/

  var basket, called = false, calledWrapper = false, dummyWrapper, plugin = 'dummy';

  function Dummy() {
    this.dummyFunction = function() {
      called = true;
    };
  }

  function plugDummy( withWrapper ) {
    dummyWrapper = !!withWrapper ? window.simplebasket.getBasePluginWrapper(plugin) : window.simplebasket.getBasePlugin(plugin);
    dummyWrapper.dummyFunction = function() {
      calledWrapper = true;
      this[plugin].dummyFunction();
    };
    return window.simplebasket.plug(dummyWrapper);
  }

  function loseDummy(force) {
    return window.simplebasket.lose(dummyWrapper, force);
  }

  function isPlugged( value ) {
    (window.simplebasket.Basket.prototype['I' + dummyWrapper.type.toUpperCase()] !== undefined).should.equal(value);
    value && ((window.simplebasket.Basket.prototype['I' + dummyWrapper.type.toUpperCase()]).should.equal(dummyWrapper.type));
  }

  describe('#plug==>', function() {

    beforeEach(function() {
      basket = window.simplebasket.create();
      called = false;
      calledWrapper = false;
    });
    it('should get valid BasePluginWrapper', function() {

      function isValid( name, value ) {
        var obj;
        obj = window.simplebasket.getBasePluginWrapper(name);
        (obj.constructor.prototype.constructor.name === 'BasePluginWrapper').should.equal(value);
        obj = window.simplebasket.getBasePlugin(name);
        (obj.constructor.prototype.constructor.name === 'BasePluginWrapper').should.equal(value);
      }
      isValid('dummy', true);
      isValid('', false);
      isValid(undefined, false);
      isValid(null, false);
      isValid('notvalid-#', false);
    });

    it('should plug plugin wrapper', function() {
      (plugDummy(true)).should.equal(true);
      isPlugged(true);
    });
    it('should lose plugin', function() {
      (loseDummy()).should.equal(true);
      isPlugged(false);
    });
    it('should plug plugin wrapper with direct call', function() {
      (plugDummy()).should.equal(true);
      isPlugged(true);
    });
    it('should lose plugin', function() {
      (loseDummy()).should.equal(true);
      isPlugged(false);
    });
    it('should not allow plug with invalid object', function() {
      function Dummy() {
      }
      var wrapperObj = new Dummy();
      (window.simplebasket.plug(wrapperObj)).should.equal(false);
    });
  });
  describe('#implements with wrapper==>', function() {

    before(function(){
      plugDummy(true);
    });
    beforeEach(function() {
      basket = window.simplebasket.create();
      called = false;
      calledWrapper = false;
    });

    function isImplemented( value, instanceBasket ) {
      var b = instanceBasket || basket;
      called = false;
      calledWrapper = false;

      (Object.prototype.hasOwnProperty.call(b, 'dummyFunction')).should.equal(value);
      if ( value ) {
        b.dummyFunction();
        (calledWrapper).should.equal(true);
        (called).should.equal(true);
      }
      else {
        (b.dummyFunction === undefined).should.equal(true);
        (calledWrapper).should.equal(false);
        (called).should.equal(false);
      }
    }

    it('should allow implement', function() {
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);
    });
    it('should not allow implement if already implemented', function() {
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(false);
    });
    it('should not allow implement with invalid driver', function() {
      function InvalidDummy() {
      }
      (basket.implements(basket.IDUMMY, new InvalidDummy())).should.equal(false);
      isImplemented(false);
    });
    it('should return undefined if not implemented', function() {
      (basket.dummy === undefined).should.equal(true);
    });
    it('should cancel implements', function() {
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);
      (basket.prevent(basket.IDUMMY)).should.equal(true);
      isImplemented(false);
    });
    it('should not allow use if instance does not implements', function() {
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);

      var basket2 = window.simplebasket.create();
      isImplemented(false, basket2);
    });
    it('should allow various implementations', function() {
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);
      var basket2 = window.simplebasket.create();
      (basket2.implements(basket2.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true, basket2);
    });
    it('should not allow new implementation after "weak" lose', function() {
      loseDummy();
      (basket.implements(plugin, new Dummy())).should.equal(false);
      isImplemented(false);
    });
    it('should force lose', function() {
      (Object.prototype.hasOwnProperty.call(window.simplebasket.Basket.prototype, dummyWrapper.type)).should.equal(true);
      loseDummy(true);
      (Object.prototype.hasOwnProperty.call(window.simplebasket.Basket.prototype, dummyWrapper.type)).should.equal(false);
    });
    it('should mantain implementation on instances after "weak" lose', function() {
      plugDummy(true);
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);
      loseDummy();
      isImplemented(true);
    });
    it('should allow prevent on instance after "weak" lose', function() {
      loseDummy(true);
      plugDummy(true);

      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);
      loseDummy();
      isImplemented(true);
      (basket.prevent(plugin)).should.equal(true);
      isImplemented(false);
    });
  });

  describe('#implements without wrapper==>', function() {

    before(function(){
      loseDummy(true);
      plugDummy();
    });
    beforeEach(function() {
      basket = window.simplebasket.create();
      called = false;
      calledWrapper = false;
    });

    function isImplemented( value, instanceBasket ) {
      var b = instanceBasket || basket;
      called = false;
      calledWrapper = false;

      (Object.prototype.hasOwnProperty.call(b, 'dummyFunction')).should.equal(value);
      if ( value ) {
        b.dummyFunction();
        (called).should.equal(true);
        (calledWrapper).should.equal(false);
      }
      else {
        (b.dummyFunction === undefined).should.equal(true);
        (called).should.equal(false);
        (calledWrapper).should.equal(false);
      }
    }

    it('should allow implement', function() {
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);
    });
    it('should not allow implement if already implemented', function() {
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(false);
    });
    it('should not allow implement with invalid driver', function() {
      function InvalidDummy() {
      }
      (basket.implements(basket.IDUMMY, new InvalidDummy())).should.equal(false);
      isImplemented(false);
    });
    it('should return undefined if not implemented', function() {
      (basket.dummy === undefined).should.equal(true);
    });
    it('should cancel implements', function() {
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);
      (basket.prevent(basket.IDUMMY)).should.equal(true);
      isImplemented(false);
    });
    it('should not allow use if instance does not implements', function() {
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);

      var basket2 = window.simplebasket.create();
      isImplemented(false, basket2);
    });
    it('should allow various implementations', function() {
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);
      var basket2 = window.simplebasket.create();
      (basket2.implements(basket2.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true, basket2);
    });
    it('should not allow new implementation after "weak" lose', function() {
      loseDummy();
      (basket.implements(plugin, new Dummy())).should.equal(false);
      isImplemented(false);
    });
    it('should mantain implementation on instances after "weak" lose', function() {
      plugDummy();
      (basket.implements(basket.IDUMMY, new Dummy())).should.equal(true);
      isImplemented(true);
      loseDummy();
      isImplemented(true);
    });
  });
});
