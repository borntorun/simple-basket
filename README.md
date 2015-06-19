# simple-basket

A simple javascript basket for values.

Store values and objects in an array in memory.

Dependencies
----------

[lodash] (https://github.com/lodash/lodash) **version: ~3.9.3**

For use the localforageDriver with the storage wrapper:

[localforage] (https://github.com/mozilla/localForage) **version ~1.2.3**
[localforage-sessionstoragewrapper] (https://github.com/thgreasi/localForage-sessionStorageWrapper) **version ~1.0.1**

How to use
----------

* Install with Bower

```
$ bower install simple-basket
```

* Install with npm

```
$ npm install simple-basket
```

* or get the javascript in dist folder: simplebasket.js

## Use

Create a basket:

```
//on browser
var basket = window.simplebasket.create();

//on node
var basket = require('simple-basket').create();
```

Add items:

```
basket.add(1,2,3,4,5);
```

Get items

```
console.log(basket.getall()); //[1, 2, 3, 4, 5]
```

## simplebasket Interface

* create() - Initialize a new basket

## Basket Interface

* add() - Add one or more items to basket
* set() - Sets the basket cloning from an array of values
* getClone() - Returns all items in basket (clone)
* remove() - Remove an item(s) by a reference a key/value pair
* removeAt() - Remove one item by position
* removeAll() - Removes all items in the basket (Clear the basket)
* iterate() - Iterate the basket calling a function for each item 
* count() - Returns the number of items in the basket

## Extending the basket

Its possible to extend simplebasket using simplebasket-extend.js:
This extends the simplebasket interface with these method:

* plug() - permits plugging a plugin-wrapper
* lose() - unplugg a plugin-wrapper
* getBasePluginWrapper() - just to get the plugin base object 

The Basket interface is extended with:

* implements() - permits an instance to use a driver that implements a wrappwer-plugin interface

The package comes with a storage.js wrapper and a localforageDriver.js that permits a basket to be saved in browser databases with the localforage package.

### Example

(Include  simplebasket-extend.js, storage.js and localforageDriver.js)

```
var basket, lfDriver;

basket = window.simplebasket.create();
basket.add({key: 1}, {key: 2}, {key: 3});

window.localforageDriver
  .create(window.localforageDriver.STORAGE.LOCALSTORAGE, {name: 'app', storeName: 'store', key: 'basket'})
  .then(function( value ) {
  
    lfDriver = value;
    basket.implements(basket.ISTORAGE, lfDriver);
    
    basket.save()
      .then(function( data ) {
        //basket was saved to storage
      })
      .catch(function( error ) {
        //error
      });
    basket.load()
      .then(function( data ) {
        //data loaded from storage to basket
      })
      .catch(function( error ) {
        //error
      });
});


```

Notes
---------------

* This is a work in progress.

Contribution
---------------

* Contributions and comments are welcome.

Authors
-------

* **João Carvalho** 
  * [@jmmtcarvalho](https://twitter.com/jmmtcarvalho) 
  * [GitHub](https://github.com/borntorun)

License
-------

Copyright (c) 2015 João Carvalho

Licensed under the MIT License
