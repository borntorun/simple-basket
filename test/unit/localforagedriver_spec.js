describe('localforageDriver', function() {
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

  function doneTry( done, expectations ) {
    try {
      expectations();
      done();
    }
    catch( e ) {
      done(e);
    }
  }

  describe('#create & config==>', function() {
    var localforageDriver;

    beforeEach(function( done ) {
      window.localforageDriver.create().then(function( value ) {
        localforageDriver = value;
        done();
      });
    });

    it('should be created', function() {
      (localforageDriver.name).should.equal('localforageDriver');
    });

    it('should allow config localstorage', function( done ) {
      localforageDriver.config(window.localforageDriver.STORAGE.LOCALSTORAGE)
        .then(function() {
          done();
        })
        .catch(function( error ) {
          done(error);
        });
    });
    //if ( phantom) {
    /*it('should allow config indexeddb', function( done ) {
      localforageDriver.config(window.localforageDriver.STORAGE.INDEXEDDB)
        .then(function() {
          done();
        })
        .catch(function(error) {
          done(error);
        });
    });*/
    //}

    it('should allow config websql', function( done ) {
      localforageDriver.config(window.localforageDriver.STORAGE.WEBSQL)
        .then(function() {
          done();
        })
        .catch(function( error ) {
          done(error);
        });
    });

    it('should allow config sessionstorage', function( done ) {
      localforageDriver.config(window.localforageDriver.STORAGE.SESSIONSTORAGE)
        .then(function() {
          done();
        })
        .catch(function( error ) {
          done(error);
        });
    });

    it('should be configured with default options', function( done ) {
      localforageDriver.config(window.localforageDriver.STORAGE.LOCALSTORAGE)
        .then(function() {
          var opt = localforageDriver.getOptions();
          doneTry(done, function() {
            (opt.name).should.equal('app-localforageDriver');
            (opt.storeName).should.equal('store');
            console.log(opt.description);
            (opt.description).should.equal('');
            (opt.key).should.equal('key');
          });
        })
        .catch(function( error ) {
          done(error);
        });

    });

    it('should not allow unknown driver config', function( done ) {
      localforageDriver.config('not a driver')
        .then(function() {
          done(false);
        })
        .catch(function() {
          done();
        });
    });

    it('should not allow double config', function( done ) {
      localforageDriver.config(window.localforageDriver.STORAGE.LOCALSTORAGE)
        .then(function() {
          localforageDriver.config(window.localforageDriver.STORAGE.LOCALSTORAGE)
            .catch(function( error ) {
              doneTry(done, function() {
                (error.message).should.equal('Config already called.');
              });
            });
        })
        .catch(function( error ) {
          done(error);
        });
    });

    it('should allow create multiple instances', function( done ) {
      window.localforageDriver.create()
        .then(function( value ) {
          doneTry(done, function() {
            (value).should.not.equal(localforageDriver);
          });

        }).catch(function( error ) {
          done(error);
        });
    });
  });

  describe('#config on create==>', function() {

    it('should be created and configured with default options', function( done ) {
      window.localforageDriver.create(window.localforageDriver.STORAGE.LOCALSTORAGE)
        .then(function( value ) {
          var opt = value.getOptions();
          doneTry(done, function() {
            (opt.name).should.equal('app-localforageDriver');
            (opt.storeName).should.equal('store');
            (opt.description).should.equal('');
            (opt.key).should.equal('key');
            (value.name).should.equal('localforageDriver');
          });
        })
        .catch(function( error ) {
          done(error);
        });
    });
    it('should be created and configured with passed in options', function( done ) {
      window.localforageDriver.create(window.localforageDriver.STORAGE.LOCALSTORAGE,
        {key: 'testKey', name: 'testName', storeName: 'testStoreName', description: 'testDescription'})
        .then(function( value ) {
          var opt = value.getOptions();
          doneTry(done, function() {
            (opt.name).should.equal('testName');
            (opt.storeName).should.equal('testStoreName');
            (opt.description).should.equal('testDescription');
            (opt.key).should.equal('testKey');
            (value.name).should.equal('localforageDriver');
          });
        })
        .catch(function( error ) {
          done(error);
        });
    });
  });

  describe('#save & load==>', function() {
    var localforageDriver,
      valueToSave = '12345';

    beforeEach(function( done ) {
      window.localforageDriver.create(window.localforageDriver.STORAGE.LOCALSTORAGE).then(function( value ) {
        localforageDriver = value;
        done();
      });
    });
    it('should save value on localstore', function( done ) {
      localforageDriver.save(valueToSave)
        .then(function( data ) {
          doneTry(done, function() {
            (data).should.equal(valueToSave);
            var theValueSaved = window.localStorage.getItem('app-localforageDriver/key');
            (theValueSaved).should.equal(JSON.stringify(valueToSave));
          });
        })
        .catch(function( error ) {
          done(error);
        });
    });
    it('should get value on localstore', function( done ) {
      var anotherValue = '54321';
      localforageDriver.save(anotherValue)
        .then(function() {
          localforageDriver.load()
            .then(function( data ) {
              doneTry(done, function() {
                (data).should.equal(anotherValue);
              });
            });
        })
        .catch(function( error ) {
          done(error);
        });

    });
    it('should not allow save before config', function( done ) {

      window.localforageDriver.create().then(function( value ) {
        localforageDriver = value;

        localforageDriver.save(valueToSave)
          .then(function() {
            done(false);
          })
          .catch(function( error ) {
            doneTry(done, function() {
              (error.message).should.equal('Storage driver config is in invalid state.');
            });
          });
      });

    });
    it('should not allow load before config', function( done ) {

      window.localforageDriver.create().then(function( value ) {
        localforageDriver = value;
        localforageDriver.load()
          .then(function() {
            done(false);
          })
          .catch(function( error ) {
            doneTry(done, function() {
              (error.message).should.equal('Storage driver config is in invalid state.');
            });
          });
      });

    });
  });

  describe('#save & load sessionstorage==>', function() {
    var localforageDriver,
      valueToSave = '12345';

    beforeEach(function( done ) {
      window.localforageDriver.create(window.localforageDriver.STORAGE.SESSIONSTORAGE)
        .then(function( value ) {
          localforageDriver = value;
          done();
        })
        .catch(function( error ) {
          done(error);
        });
    });
    it('should save value', function( done ) {
      localforageDriver.save(valueToSave)
        .then(function( data ) {
          doneTry(done, function() {
            (data).should.equal(valueToSave);
            var theValueSaved = window.sessionStorage.getItem('app-localforageDriver/key');
            (theValueSaved).should.equal(JSON.stringify(valueToSave));
          });
        })
        .catch(function( error ) {
          done(error);
        });
    });
    it('should get value', function( done ) {
      var anotherValue = '54321';
      localforageDriver.save(anotherValue)
        .then(function() {
          localforageDriver.load()
            .then(function( data ) {
              doneTry(done, function() {
                (data).should.equal(anotherValue);
              });
            });
        })
        .catch(function( error ) {
          done(error);
        });

    });

  });

  describe('#delete localstorage==>', function() {
    var localforageDriver;

    beforeEach(function( done ) {
      window.localforageDriver.create(window.localforageDriver.STORAGE.LOCALSTORAGE).then(function( value ) {
        localforageDriver = value;
        done();
      });
    });
    it('should delete value', function( done ) {
      localforageDriver.clear()
        .then(function() {
          doneTry(done, function() {
            var theValueSaved = window.localStorage.getItem('app-localforageDriver/key');
            (theValueSaved === null).should.equal(true);
          });
        })
        .catch(function( error ) {
          done(error);
        });
    });
    it('should be silent whan deleting value not saved', function( done ) {
      localforageDriver.clear()
        .then(function() {
          done();
        })
        .catch(function( error ) {
          done(error);
        });
    });
  });

  describe('#delete sessionstorage==>', function() {
    var localforageDriver;

    beforeEach(function( done ) {
      window.localforageDriver.create(window.localforageDriver.STORAGE.SESSIONSTORAGE)
        .then(function( value ) {
          localforageDriver = value;
          done();
        })
        .catch(function( error ) {
          done(error);
        });
    });
    it('should clear value', function( done ) {
      localforageDriver.clear()
        .then(function() {
          doneTry(done, function() {
            var theValueSaved = window.sessionStorage.getItem('app-localforageDriver/key');
            (theValueSaved === null).should.equal(true);
          });
        })
        .catch(function( error ) {
          done(error);
        });
    });
    it('should be silent whan clearing value not saved', function( done ) {
      localforageDriver.clear()
        .then(function() {
          done();
        })
        .catch(function( error ) {
          done(error);
        });
    });
  });
});
