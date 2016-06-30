module.exports = function (grunt) {
  var semver = require('semver'),
    child_process = require('child_process'),
    format = require('util').format,
    readlineSync = require('readline-sync'),
    serveStatic = require('serve-static');

  require('load-grunt-tasks')(grunt);
  //need this to get version... dont work in grunt-sed with <%= pkg.version %>!!! did not understand why!
  var pk = grunt.file.readJSON('package.json'),
    gitVersion;
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    buildDir: 'dist',
    banner: [
      //      '/*!',
      //      ' * <%= pkg.name %> v%%VERSION%%',
      //      ' * <%= pkg.homepage %>',
      //      ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>; Licensed MIT',
      //      ' */\n'
      '/*!',
      ' * <%= pkg.name %> - <%= pkg.description %>.',
      ' * <%= pkg.homepage %>',
      ' * Copyright (c) 2015 <%= pkg.author %>',
      ' * Licensed under MIT license',
      ' *     See https://github.com/borntorun/simple-basket/blob/master/LICENSE',
      ' * v%%VERSION%%',
      ' */\n'
    ].join('\n'),
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '<%= buildDir %>/*'
            ]
          }
        ]
      }
    },
    sed: {
      version: {
        pattern: '%%VERSION%%',
        replacement: function () {
          return grunt.option('tag') || pk.version;
        },
        recursive: true,
        path: '<%= buildDir %>'
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        files: {
          '<%= buildDir %>/<%= pkg.namedist %>.js': ['src/<%= pkg.namedist %>.js'],
          '<%= buildDir %>/plugins/storage/storage.js': ['src/plugin-wrapper/storage.js'],
          '<%= buildDir %>/plugins/storage/storage-localforage.js': [
            'bower_components/es6-promise/promise.js',
            'bower_components/localforage/dist/localforage.nopromises.js',
            'bower_components/localforage-sessionstoragewrapper/src/localforage-sessionstoragewrapper.js',
            'src/plugin-wrapper/storage.js',
            'src/drivers/localforageDriver.js'],
          '<%= buildDir %>/plugins/storage/with-promise-polyfill/storage.js': [
            'bower_components/es6-promise/promise.js',
            'src/plugin-wrapper/storage.js'
          ],
          '<%= buildDir %>/plugins/storage/drivers/localforageDriver.js': ['src/drivers/localforageDriver.js'],
          '<%= buildDir %>/plugins/storage/drivers/with-promise-polyfill/localforageDriver.js': [
            'bower_components/es6-promise/promise.js',
            'src/drivers/localforageDriver.js'
          ]
        }
      }
    },
    jshint: {
      options: {
        jshintrc: true,
        multistr: true,
        '-W030': true
      },
      build: ['Grunfile.js', 'src/**/*.js', 'test/**/*_spec.js']
    },
    uglify: {
      options: {
        footer: '\n',
        mangle: true,
        beautify: false,
        compress: true,
        indent_level: 0
      },
      buildpkg: {
        options: {
          banner: '<%= banner %>',
          mangle: {
            except: ['Basket', 'BasePluginWrapper']
          }
        },
        files: {
          '<%= buildDir %>/<%= pkg.namedist %>.min.js': ['<%= buildDir %>/<%= pkg.namedist %>.js']
        }
      },
      buildpluginstorage: {
        options: {
          banner: [
            '/*!',
            ' * storage.js',
            ' * storage plugin wrapper to use with',
            ' * simplebasket (https://github.com/borntorun/simple-basket)',
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>; Licensed MIT',
            ' */\n'
          ].join('\n')
        },
        files: {
          '<%= buildDir %>/plugins/storage/storage.min.js': ['<%= buildDir %>/plugins/storage/storage.js']
        }
      },
      buildpluginstorageWithpolyfill: {
        options: {
          banner: [
            '/*!',
            ' * storage.js',
            ' * storage plugin wrapper to use with',
            ' * simplebasket (https://github.com/borntorun/simple-basket)',
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>; Licensed MIT',
            ' */',
            '/*',
            ' * This package includes the following packages:',
            ' */',
            '/*!',
            ' * @overview es6-promise - a tiny implementation of Promises/A+.',
            ' * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)',
            ' * @license   Licensed under MIT license',
            ' *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE',
            ' * @version   2.3.0',
            ' */\n',
          ].join('\n')
        },
        files: {
          '<%= buildDir %>/plugins/storage/with-promise-polyfill/storage.min.js': ['<%= buildDir %>/plugins/storage/with-promise-polyfill/storage.js']
        }
      },
      buildpluginstoragelocalforage: {
        options: {
          banner: [
            '/*!',
            ' * storage.js',
            ' * storage plugin wrapper to use with',
            ' * simplebasket (https://github.com/borntorun/simple-basket)',
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>; Licensed MIT',
            ' */',
            '/*!',
            ' * localforageDriver.js',
            ' * Driver for localforage (https://github.com/mozilla/localForage)',
            ' * Supports all internal drivers in localforage plus:',
            ' * - sessionStorageWrapper (https://github.com/thgreasi/localForage-sessionStorageWrapper)',
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>; Licensed MIT',
            ' */',
            '/*',
            ' * This package includes the following packages:',
            ' */',
            '/*!',
            ' * @overview es6-promise - a tiny implementation of Promises/A+.',
            ' * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)',
            ' * @license   Licensed under MIT license',
            ' *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE',
            ' * @version   2.3.0',
            ' */',
            '/*!',
            '    localForage -- Offline Storage, Improved',
            '    Version 1.2.4',
            '    https://mozilla.github.io/localForage',
            '    (c) 2013-2015 Mozilla, Apache License 2.0',
            '*/',
            '/*!',
            '    localForage-sessionStorageWrapper (https://github.com/thgreasi/localForage-sessionStorageWrapper/blob/master/LICENSE)',
            ' */\n',
          ].join('\n')
        },
        files: {
          '<%= buildDir %>/plugins/storage/storage-localforage.min.js': ['<%= buildDir %>/plugins/storage/storage-localforage.js']
        }
      },
      buildlocalforageDriver: {
        options: {
          banner: [
            '/*!',
            ' * localforageDriver.js',
            ' * Driver for localforage (https://github.com/mozilla/localForage)',
            ' * Supports all internal drivers in localforage plus:',
            ' * - sessionStorageWrapper (https://github.com/thgreasi/localForage-sessionStorageWrapper)',
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>; Licensed MIT',
            ' */\n'
          ].join('\n')
        },
        files: {
          '<%= buildDir %>/plugins/storage/drivers/localforageDriver.min.js': ['<%= buildDir %>/plugins/storage/drivers/localforageDriver.js']
        }
      },
      buildlocalforageDriverWithpolyfill: {
        options: {
          banner: [
            '/*!',
            ' * localforageDriver.js',
            ' * Driver for localforage (https://github.com/mozilla/localForage)',
            ' * Supports all internal drivers in localforage plus:',
            ' * - sessionStorageWrapper (https://github.com/thgreasi/localForage-sessionStorageWrapper)',
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>; Licensed MIT',
            ' */',
            '/*',
            ' * This package includes the following packages:',
            ' */',
            '/*!',
            ' * @overview es6-promise - a tiny implementation of Promises/A+.',
            ' * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)',
            ' * @license   Licensed under MIT license',
            ' *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE',
            ' * @version   2.3.0',
            ' */\n',
          ].join('\n')
        },
        files: {
          '<%= buildDir %>/plugins/storage/drivers/with-promise-polyfill/localforageDriver.min.js': ['<%= buildDir %>/plugins/storage/drivers/with-promise-polyfill/localforageDriver.js']
        }
      }
    },
    exec: {

      karma: './node_modules/karma/bin/karma start'
    },
    /**
     * mocha unit tests
     */
    mocha: {
      unit: {
        options: {
          log: true,
          logErrors: true,
          run: true,
          urls: [
            'http://localhost:8888/test/unit/simplebasket.html',
            'http://localhost:8888/test/unit/localforagedriver.html',
            'http://localhost:8888/test/unit/storage-localforage.html'
          ]
        }
      },
      unitdeploy: {
        options: {
          logErrors: true,
          urls: [
            'http://localhost:8888/test/unit/simplebasket-deploy.html',
            'http://localhost:8888/test/unit/localforagedriver-deploy.html',
            'http://localhost:8888/test/unit/storage-localforage-deploy.html',
            'http://localhost:8888/test/unit/storage-localforage-bundle-deploy.html'
          ]
        }
      }
    },
    /**
     * Local Web server
     */
    connect: {
      options: {
        base: '.',
        hostname: '*',
        port: 8888,
        middleware: function (connect) {
          return [
            function (req, res, next) {
              res.setHeader('Access-Control-Allow-Origin',
                '*');
              res.setHeader('Access-Control-Allow-Methods',
                '*');
              return next();
            },
            //connect.static(require('path').resolve('.'))
            serveStatic(require('path').resolve('.'))
          ];
        }
      },
      e2etest: {
        /*options: {
         // set the location of the application files
         base: ['app']
         }*/
      }
    },
    ngdocs: {
      all: ['src/**/*.js']
    },
    jsdoc: {
      dist: {
        src: ['src/*.js'],
        options: {
          destination: 'doc',
          template: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
          configure: 'jsdoc.conf.json'
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      'mochaunit': {
        files: [
          'src/**/*.js',
          'test/unit/*.js',
          'test/unit/*.html'
        ],
        tasks: ['jshint', 'mocha:unit']
      }
      ////            karma: {
      ////                files: ['app/js/**/*.js', 'test/unit/*.js'],
      ////                tasks: ['karma:continuous:run']
      ////            },
      //protractor: {
      //  files: ['test/e2e/*.html', 'src/**/*.js', 'test/e2e/*_spec.js'],
      //  tasks: ['protractor:continuous']
      //}
    },
    releasebuild: {
      default: {},
      minor: {
        options: {
          type: 'minor'
        }
      }
    }

  });

  /**
   * Test tasks
   */
  grunt.registerTask('test', ['jshint', 'connect', 'mocha:unit', 'watch:mochaunit']);
  grunt.registerTask('test:deploy', ['connect', 'mocha:unitdeploy']);
  /**
   * Build Task
   */
  grunt.registerTask('build', ['jshint', 'concat', 'uglify', 'sed:version']);
  /**
   * Release
   */
  grunt.registerTask('release', ['releasebuild:default']);
  grunt.registerTask('release:minor', ['releasebuild:minor']);
  /**
   * Default
   */
  grunt.registerTask('default', ['build']);
};
