
this.mocha.setup('bdd');

function runTests() {
  var runner = this.mocha.run();

  var failedTests = [];

  runner.on('end', function() {
    window.mochaResults = runner.stats;
    window.mochaResults.reports = failedTests;
  });

  function flattenTitles( test ) {
    var titles = [];

    while ( test.parent.title ) {
      titles.push(test.parent.title);
      test = test.parent;
    }

    return titles.reverse();
  }

  function logFailure( test, err ) {
    failedTests.push({
      name: test.title,
      result: false,
      message: err.message,
      stack: err.stack,
      titles: flattenTitles(test)
    });
  }

  runner.on('fail', logFailure);
}

if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function( callback, thisArg ) {
    if ( typeof(callback) !== "function" ) {
      throw new TypeError(callback + " is not a function!");
    }
    var len = this.length;
    for ( var i = 0; i < len; i++ ) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}



if ( this.addEventListener ) {
  this.addEventListener('load', runTests);
}
else if ( this.attachEvent ) {
  this.attachEvent('onload', runTests);
}
