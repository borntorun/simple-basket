describe('simplebasket', function() {
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

  beforeEach(function() {
    basket = window.simplebasket.create();
  });

  describe('#create==>', function() {

    function useCaseOptionsUndefined(val) {
      var b = window.simplebasket.create(val);
      (b.getOptions().uniqueKey === undefined).should.equal(true);
    }

    it('should create with no options', function() {
      var b = window.simplebasket.create();
      (b.getOptions().uniqueKey === undefined).should.equal(true);
    });
    it('should create but silent invalid options', function() {
      useCaseOptionsUndefined({invalid:'test'});
      useCaseOptionsUndefined(1);
      useCaseOptionsUndefined(true);
      useCaseOptionsUndefined({});
      useCaseOptionsUndefined('test');
      useCaseOptionsUndefined(null);
      useCaseOptionsUndefined(undefined);
      useCaseOptionsUndefined({uniqueKey:{}});
      useCaseOptionsUndefined({uniqueKey:1});
      useCaseOptionsUndefined({uniqueKey:true});
      useCaseOptionsUndefined({uniqueKey:null});
      useCaseOptionsUndefined({uniqueKey:undefined});
    });
    it('should create with valid option', function() {
      var b = window.simplebasket.create({uniqueKey: 'key'});
      (b.getOptions().uniqueKey === undefined).should.equal(false);
      (b.getOptions().uniqueKey).should.equal('key');
    });
  });
  describe('#add==>', function() {
    it('should add 1 item to basket', function() {
      basket.add({o: 1});
      (basket.count()).should.equal(1);
    });
    it('should add 3 item to basket', function() {
      basket.add({o: 1});
      basket.add({o: 2});
      basket.add({o: 3});
      (basket.count()).should.equal(3);
    });
    it('should not add duplicate items if uniqueKey is set', function() {
      var b = window.simplebasket.create({uniqueKey: 'o'});
      var itemkey = '0101010101';
      b.add({o: itemkey, item: 1});
      (b.count()).should.equal(1);

      b.add({o: itemkey, item: 2});
      (b.count()).should.equal(1);
      (b.getAll()[0].item).should.equal(1);

      b.add({o: itemkey, item: 3},{o: itemkey, item: 4},{o: itemkey, item: 5});
      (b.count()).should.equal(1);
      (b.getAll()[0].item).should.equal(1);

      b = window.simplebasket.create({uniqueKey: 'o'});
      b.add([{o: itemkey, item: 1},{o: 100, item: 2},{o: itemkey, item: 3}]);
      (b.count()).should.equal(2);
      (b.getAll()[0].item).should.equal(1);
      (b.getAll()[1].item).should.equal(2);

    });
  });
  describe('#get...==>', function() {
    it('getAll', function() {
      basket.add({o: 1});
      (basket.count()).should.equal(1);
      basket.add({o: 2});
      basket.add({o: 3});
      var copy = basket.getAll();
      (_.isArray(copy)).should.be.true;
      (copy.length).should.equal(3);
    });
    it('getClone', function() {
      basket.add({o: 1});
      (basket.count()).should.equal(1);
      basket.add({o: 2});
      basket.add({o: 3});
      var clone = basket.getClone();
      (_.isArray(clone)).should.be.true;
      (clone.length).should.equal(3);
    });
    it('getAll should copy items and mantain references', function() {
      var a = [1, 2, 3],
        b = {o: 1};

      basket.add(a, b);

      (basket.count()).should.equal(2);

      var copy = basket.getAll();
      (copy[0]).should.equal(a);
      (copy[1]).should.equal(b);

      a[0] = 'ola';
      b.x = 'x';

      //console.log('a=>', a, 'b=>', b, 'copy=>', copy, 'getAll=>', basket.getAll());

      (copy[0]).should.equal(a);
      (copy[0][0]).should.equal('ola');
      (basket.getAll()[0][0]).should.equal('ola');

      (copy[1]).should.equal(b);
      (copy[1].x).should.equal('x');
      (basket.getAll()[1]).should.equal(b);
      (basket.getAll()[1].x).should.equal('x');

      copy[0][0] = 1;
      delete copy[1].x;

      //console.log('a=>', a, 'b=>', b, 'copy=>', copy, 'getAll=>', basket.getAll());

      (copy[0]).should.equal(a);
      (copy[0][0]).should.equal(1);
      (basket.getAll()[0][0]).should.equal(1);

      (copy[1].x === undefined).should.be.true;//not.have.property('x');
      (b.x === undefined).should.be.true;//not.have.property('x');
      (basket.getAll()[1].x === undefined).should.be.true;//not.have.property('x');

      copy[0][0] = [
        { name: 'john'}
      ];

      //console.log('a=>', a, 'b=>', b, 'copy=>', copy, 'getAll=>', basket.getAll());
      (copy[0][0][0].name).should.equal('john');
      (a[0][0].name).should.equal('john');
      (basket.getAll()[0][0][0].name).should.equal('john');

      (basket.count()).should.equal(2);
      copy.push(13);
      //console.log('a=>', a, 'b=>', b, 'copy=>', copy, 'getAll=>', basket.getAll());
      (basket.count()).should.equal(3);

      copy[0].push(4);
      //console.log('a=>', a, 'b=>', b, 'copy=>', copy, 'getAll=>', basket.getAll());
      (copy[0].length).should.equal(4);
      (a.length).should.equal(4);
      (basket.getAll()[0].length).should.equal(4);

    });
    it('getClone should clone items and not mantain references', function() {
      var a = [1, 2, 3],
        b = {o: 1};

      basket.add(a, b);

      (basket.count()).should.equal(2);

      var clone = basket.getClone();
      (clone[0]).should.not.equal(a);
      (clone[1]).should.not.equal(b);

      a[0] = 'ola';
      b.x = 'x';

      //console.log('a=>', a, 'b=>', b, 'clone=>', clone, 'getAll=>', basket.getAll());

      (clone[0]).should.not.equal(a);
      (clone[0][0]).should.not.equal('ola');
      (basket.getAll()[0][0]).should.equal('ola'); //basket contains a and b

      (clone[1]).should.not.equal(b);
      (clone[1].x === undefined).should.be.true;
      (basket.getAll()[1]).should.equal(b);
      (basket.getAll()[1].x).should.equal('x');

      clone[0][0] = 1;
      delete clone[1].x;

      //console.log('a=>', a, 'b=>', b, 'clone=>', clone, 'getAll=>', basket.getAll());

      (clone[0]).should.not.equal(a);
      (clone[0][0]).should.equal(1);
      (basket.getAll()[0][0]).should.not.equal(1);

      (clone[1].x === undefined).should.be.true;//not.have.property('x');
      (b.x === undefined).should.not.be.true;//not.have.property('x');
      (basket.getAll()[1].x === undefined).should.not.be.true;//not.have.property('x');

      clone[0][0] = [
        { name: 'john'}
      ];

      //console.log('a=>', a, 'b=>', b, 'clone=>', clone, 'getAll=>', basket.getAll());
      (clone[0][0][0].name).should.equal('john');
      (a[0][0].name === undefined).should.be.true;
      (basket.getAll()[0][0][0].name === undefined).should.be.true;

      (basket.count()).should.equal(2);
      clone.push(13);
      //console.log('a=>', a, 'b=>', b, 'clone=>', clone, 'getAll=>', basket.getAll());
      (clone.length).should.equal(3);
      (basket.count()).should.equal(2);

      clone[0].push(4);
      //console.log('a=>', a, 'b=>', b, 'clone=>', clone, 'getAll=>', basket.getAll());
      (clone[0].length).should.equal(4);
      (a.length).should.equal(3);
      (basket.getAll()[0].length).should.equal(3);

    });
  });
  describe('#remove...==>', function() {

    it('should remove item by key', function() {
      basket.add(
        {o: 1},
        {o: 2, name: 'john'},
        {x: 3},
        {o: 2, name: 'mary'}
      );
      (basket.count()).should.equal(4);

      var obj = basket.remove('notexists', 1);

      (basket.count()).should.equal(4);
      (obj.length).should.equal(0);

      obj = basket.remove('o', 1);

      (basket.count()).should.equal(3);
      (obj[0].o).should.equal(1);

      obj = basket.remove('o', 2);

      (basket.count()).should.equal(1);
      (obj[0].o).should.equal(2);
      (obj[0].name).should.equal('john');
      (obj[1].o).should.equal(2);
      (obj[1].name).should.equal('mary');

      obj = basket.remove('x', 3);

      (basket.count()).should.equal(0);

    });
    it('should remove item by position', function() {
      basket.add(
        {o: 1},
        {o: 2, name: 'john'},
        {x: 3},
        {o: 2, name: 'mary'}
      );
      (basket.count()).should.equal(4);

      var obj = basket.removeAt(1);
      (basket.count()).should.equal(3);

      (obj[0].o).should.equal(2);
      (obj[0].name).should.equal('john');

      obj = basket.removeAt(3);
      (basket.count()).should.equal(3);
      (obj.length).should.equal(0);

      obj = basket.removeAt(-1);
      (basket.count()).should.equal(3);
      (obj.length).should.equal(0);

    });
    it('should remove all items', function() {
      basket.add({o: 1}, {o: 2}, {o: 3}, {o: 4});

      (basket.count()).should.equal(4);

      basket.removeAll();

      (basket.count()).should.equal(0);

    });
  });
  describe('#iterate==>', function() {
    it('should iterate items passing in a function', function() {
      basket.add({o: 1}, {o: 2}, {o: 3}, {o: 4});

      (basket.count()).should.equal(4);

      /*console.time('iterate');*/
      var me = null;
      basket.iterate(function( it, index, items ) {
        (this).should.equal(basket);
        me = this;
        items[index].value = it.o;
        it.o *= 2;
      });
      /*console.timeEnd('iterate');*/
      var copy = basket.getAll();

      (me.getAll()).should.equal(copy);

      (copy[0].o + copy[1].o + copy[2].o + copy[3].o ).should.equal(20);
      (copy[0].value + copy[1].value + copy[2].value + copy[3].value ).should.equal(10);

    });
    it('should error silence not passing in a function', function() {
      basket.add({o: 1}, {o: 2}, {o: 3}, {o: 4});

      (basket.count()).should.equal(4);

      basket.iterate('not a function');

      var copy = basket.getAll();

      (copy[0].o + copy[1].o + copy[2].o + copy[3].o ).should.equal(10);
    });
  });
  describe('#find==>', function() {
    function Obj() {
      this.o = 1;
    }

    var result, obj;

    beforeEach(function() {
      basket = window.simplebasket.create();

      obj = new Obj();

      basket.add(null, 1, 2, 3, 1,
        {o: undefined, name: 'und'},
        {o: null, name: 'null'},
        {o: 1},
        {name: 'joao', o: 1},
        {o: 2},
        new Date(2001, 1, 1), /^a/ig, 12.99, false, 10,
        {o: true, name: 'true'},
        {name: 'x', o: new Date(2001, 1, 1)},
        obj,
        undefined,
        'joao',
        new RegExp('^a', 'gi')
      );
    });
    it('should find Number in basket', function() {

      result = basket.find(1);
      (result.length).should.equal(2);
      result = basket.find({key: 'o', value: 1});
      (result.length).should.equal(3);
      result = basket.find(12.99);
      (result.length).should.equal(1);
    });
    it('should find String in basket', function() {
      result = basket.find('joao');
      (result.length).should.equal(1);
      result = basket.find({key: 'name', value: 'joao'});
      (result.length).should.equal(1);
    });
    it('should find Boolean in basket', function() {
      result = basket.find(false);
      (result.length).should.equal(1);
      result = basket.find({key: 'o', value: true});
      (result.length).should.equal(1);
    });
    /*it('should find RegExp in basket', function() {
      result = basket.find(/^a/ig);
      (result.length).should.equal(2);
    });*/
    it('should find Object in basket', function() {
      result = basket.find(obj);
      (result.length).should.equal(1);
      (result[0]).should.equal(obj);
    });
    it('should find Date in basket', function() {
      result = basket.find(new Date(2001, 1, 1));
      (result.length).should.equal(1);
      result = basket.find({key: 'o', value: new Date(2001, 1, 1)});
      (result.length).should.equal(1);
    });
    it('should not find with invalid search object', function() {
      result = basket.find({notkey: 'o'});
      (result.length).should.equal(0);
    });
    it('should find with key/value=undefined in basket', function() {

      //we are in phantomjs v.1.9.x do not run this test see:https://github.com/ariya/phantomjs/issues/11722
      if ( Object.prototype.toString.call(undefined) === '[object DOMWindow]' ) {
        return;
      }

      result = basket.find({key: 'o'});
      (result.length).should.equal(1);
      result = basket.find(undefined);
      (result.length).should.equal(1);

    });
    it('should not find if not exists key', function() {
      result = basket.find({key: 'xxx'});
      (result.length).should.equal(0);
    });
    it('should find null in basket', function() {
      //we are in phantomjs v.1.9.x do not run this test see:https://github.com/ariya/phantomjs/issues/11722
      if ( Object.prototype.toString.call(undefined) === '[object DOMWindow]' ) {
        return;
      }

      result = basket.find({key: 'o', value: null});
      (result.length).should.equal(1);
      result = basket.find(null);
      (result.length).should.equal(1);

    });
    it('should call callback with result', function( done ) {
      result = basket.find(obj, function( err, result ) {
        (err === null).should.equal(true);
        (result.length).should.equal(1);
        (result[0]).should.equal(obj);
        done();
      });
    });
    it('should call callback with error if not found', function( done ) {
      result = basket.find('sdsdsd', function( err, result ) {
        (err === null).should.equal(false);
        (result.length).should.equal(0);
        done();
      });
    });
    it('should call callback with this obj', function( done ) {
      result = basket.find(obj, function() {
        (this).should.equal(obj);
        done();
      }, obj);
    });
  });
  describe('#other==>', function() {

    it('should set an array of items to the basket', function() {
      basket.set([
        {o: 1},
        {o: 2},
        {o: 3},
        {o: 4}
      ]);

      (basket.count()).should.equal(4);

      var copy = basket.getAll();

      (copy[0].o + copy[1].o + copy[2].o + copy[3].o ).should.equal(10);

      basket.removeAll();

      var items = [
        {o: 1},
        {o: 2},
        {o: 3},
        {o: 4}
      ];

      basket.set(items);

      (basket.count()).should.equal(4);

      items[0].o++;

      copy = basket.getAll();

      (copy[0].o + copy[1].o + copy[2].o + copy[3].o ).should.equal(10);

    });

  });

});
