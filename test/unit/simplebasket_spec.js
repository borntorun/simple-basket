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
