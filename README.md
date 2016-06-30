# simple-basket

A simple javascript basket for values.

Store values and objects in an array in memory.

Dependencies
----------

[lodash](https://github.com/lodash/lodash) **version: ^4.13.1**

If you want to use the storage feature included that permits a basket to be saved in browser databases with the localforage package, you'll need:

* [es6-promise](https://github.com/jakearchibald/es6-promise) **version ~3.2.2**
* [localforage](https://github.com/mozilla/localForage) **version ~1.2.3**
* [localforage-sessionstoragewrapper](https://github.com/thgreasi/localForage-sessionStorageWrapper) **version ~1.0.1**

(the package dist includes a bundle file that ships all these 3 dependencies)


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
//add array
var aitems = [1, 2, 3, 4, 5, {'id': 1, name: 'john'}, {'id': 2, name: 'john'}];
basket.add(aitems);

//add list of items (
basket.add(1, 2, 3, 4, 5, {'id': 1, name: 'john'}, {'id': 2, name: 'john'});
```

Get items

```
basket.getall(); //[1, 2, 3, 4, 5, {'id': 1, name: 'john'}, {'id': 2, name: 'john'}]
```

Find items

```
basket.find({key: 'id', value: '2'}) //[{'id': 2, name: 'john'}]

basket.find({key: 'name', value: 'john'}) //[{'id': 1, name: 'john'}, {'id': 2, name: 'john'}]
```

## simplebasket Interface

* create() - Initialize a new Basket

##### Extending the basket

* plug() - permits plugging a plugin-wrapper
* unplug() - unplugg a plugin-wrapper
* getBasePluginWrapper() - just to get the plugin base object for use as wrapper 
* getBasePlugin() - just to get the plugin base object for use without wrapper (direct call to driver)
* Basket - get the Basket constructor

## Basket Interface

* add() - Add one or more items to basket
* set() - Sets the basket cloning from an array of values
* getClone() - Returns all items in basket (clone)
* remove() - Remove an item(s) by a reference a key/value pair
* removeAt() - Remove one item by position
* removeAll() - Removes all items in the basket (Clear the basket)
* iterate() - Iterate the basket calling a function for each item 
* count() - Returns the number of items in the basket
* find() - Find values in basket

The Basket interface is extended with:

* implement() - allows an instance Basket to implement a driver for the plugin-wrapper interface
* dispose() - removes from an instance Basket a driver implementation for the plugin-wrapper interface

The package comes with a storage.js wrapper and a localforageDriver.js that permits a basket to be saved in browser databases with the [localforage](https://github.com/mozilla/localForage) package.

## Using the storage wrapper

### Example with the localforageDriver

##### option 1 - using the complete bundle (easy)

Include File: dist/plugins/storage/storage-localforage.js
This file include all dependencies needed:

* the [es6-promise](https://github.com/jakearchibald/es6-promise)  polyfill (as the wrapper relies on promises) for browsers that don't support it - is used the same polyfill that ships with localforage;
* the [localforage](https://github.com/mozilla/localForage) package
* the [localforage-sessionstoragewrapper](https://github.com/thgreasi/localForage-sessionStorageWrapper) package for session storage

##### option 2 - install dependencies

```bower install localforage#1.2.3```

```bower install localforage-sessionstoragewrapper#1.0.1```

Include the files: 

* dist/plugins/storage/storage.js
* dist/plugins/storage/drivers/localforageDriver.js

```
var basket, lfDriver;

basket = window.simplebasket.create();
basket.add({key: 1}, {key: 2}, {key: 3});

window.localforageDriver
  .create(window.localforageDriver.STORAGE.LOCALSTORAGE, {name: 'app', storeName: 'store', key: 'basket'})
  .then(function( value ) {
  
    lfDriver = value;
    basket.implement(basket.ISTORAGE, lfDriver);
    
    //to save the basket
    basket.save()
      .then(function( data ) {
        //basket was saved to storage
      })
      .catch(function( error ) {
        //error
      });
    
    //...
    
    //to load the basket from storage:
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
