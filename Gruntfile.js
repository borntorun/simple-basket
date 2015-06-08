module.exports = function( grunt ) {
  var semver = require('semver'),
    child_process = require('child_process'),
    format = require('util').format,
    readlineSync = require('readline-sync');

  require('load-grunt-tasks')(grunt);

  //need this to get version... dont work in grunt-sed with <%= pkg.version %>!!! did not understand why!
  var pk = grunt.file.readJSON('package.json'),
    gitVersion;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    buildDir: 'dist',
    banner: [
      '/*!',
      ' * <%= pkg.name %> v%%VERSION%%',
      ' * <%= pkg.homepage %>',
      ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>; Licensed MIT',
      ' */\n\n'
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
        replacement: function() {
          return grunt.option('tag') || pk.version;
        },
        recursive: true,
        path: '<%= buildDir %>'
      }
    },
    /*ngAnnotate: {
      dist: {
        files: [
          {
            expand: true,
            src: '<%= buildDir %>/<%= pkg.name %>.js'
          }
        ]
      }
    },*/
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/**/*.js'],
        dest: '<%= buildDir %>/<%= pkg.name %>.js'
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
        banner: '<%= banner %>',
        footer: '\n'
      },
      build: {
        options: {
          mangle: true,
          beautify: false,
          compress: true,
          indent_level: 0
        },
        files: {
          '<%= buildDir %>/<%= pkg.name %>.min.js': ['<%= buildDir %>/<%= pkg.name %>.js']
        }
      }
    },
    shell: {
      options: {
        stdout: true,
        stderr: true
      },

      /**
       * Get remote repos on git and set grunt.option('remote');
       * If more than one user is able to choose which
       */
      remote: {
        command: function( ok ) {

          //return (ok && 'gruntlistremotes=$(git remote);printf "$gruntlistremotes"') || '$(exit 1)';
          return ok === 'true' ?
            'gruntlistremotes=$(git remote);printf "$gruntlistremotes"'
            :
            '$(echo "Task shell:remote not running" >&2 ; exit 1)';
        },
        options: {
          async: false,
          stdout: false,
          stderr: true,
          stdin: false,
          callback: function( error, stdout, stderr, cb ) {
            if ( error !== 0 ) {
              grunt.log.write('Error:', error, '\n');
              cb(false);
            }
            else {
              var remotes = stdout.split('\n');
              if ( remotes.length === 1 ) {
                grunt.option('remote', remotes[0]);
                cb();
                return;
              }
              remotes.forEach(function( item, idx, alist ) {
                alist[idx] = [ '[', idx + 1, ']-', item].join('');
              });

              var resp = 0;
              grunt.log.writeln(format('%s ', '\n\nThere are more than 1 remote associate with this repo, please choose the one to push into.\n\n' + remotes));
              while ( isNaN(resp) || resp === 0 || resp > remotes.length ) {
                resp = readlineSync.question('\nYour choice?');
                if ( resp === '' ) {
                  cb(false);
                  return;
                }
                resp = parseInt(resp);
              }
              grunt.option('remote', stdout.split('\n')[resp - 1]);//using original array
              //grunt.log.write(grunt.option('remote'));
              cb();
            }

          }
        }
      },
      /**
       * Git Tag with value in grunt.option("tag")
       * (called from task release)
       */
      tag: {
        command: function( ok ) {
          return ok === 'true' ?
            'git tag -a v<%= grunt.option("tag") %> -m \'Version <%= grunt.option("tag") %>\''
            :
            '$(echo "Task shell:tag not running" >&2 ; exit 1)';
          //return ok? 'xxxgit tag -a v<%= grunt.option("tag") %> -m \'Version <%= grunt.option("tag") %>\'' : '$(exit 1)';
        },
        options: {
          stdout: false,
          stderr: true,
          stdin: false,
          callback: function( error, stdout, stderr, cb ) {
            if ( error !== 0 ) {
              grunt.log.write('Error:', error, '\n');
              cb(false);
            }
            cb();
          }
        }
      },
      /**
       * Git push to remote with tags
       * (called from task push)
       */
      push: {
        command: function( ok ) {
          return ok === 'true' ?
            'git push <%= grunt.option("remote") %> master --tags'
            :
            '$(echo "Task shell:push not running" >&2 ; exit 1)';
        },
        options: {
          stdout: false,
          stderr: true,
          stdin: false,
          callback: function( error, stdout, stderr, cb ) {
            if ( error !== 0 ) {
              grunt.log.write('Error:', error, '\n');
              cb(false);
            }
            cb();
          }
        }
      }
    },
    step: {
      options: {
        option: false
      }
    },
    exec: {
      /**
       * Tasks used for releas to get git status, branch, add and commit
       */
      test_git_on_master: '[[ $(git symbolic-ref --short -q HEAD) = master ]]',
      test_git_is_clean: '[[ -z "$(git status --porcelain)" ]]',
      git_add: 'git add .',
      git_commit: {
        cmd: function( m ) {
          return format('git commit -m "%s"', m);
        }
      },

      karma: './node_modules/karma/bin/karma start'
    },

    /**
     * mocha unit tests
     */
    mocha: {
      unit: {
        options: {
          logErrors:true,
          urls: [
            'http://localhost:8888/test/unit/main.html'
          ]
        }
      }
    },
    /**
     * e2e tests with protractor
     */
    /*protractor_webdriver: {
      update: {
        options: {
          path: './node_modules/.bin/',
          command: 'webdriver-manager update --standalone'
        }
      },
      continuous: {
        options: {
          keepAlive: true,
          path: './node_modules/.bin/',
          command: 'webdriver-manager start --seleniumPort 4444'
        }
      },
      single: {
        options: {
          keepAlive: false,
          path: './node_modules/.bin/',
          command: 'webdriver-manager start --seleniumPort 4444'
        }
      }
    },
    protractor: {
      options: {
        configFile: "test/e2e/local/protractor.js",
        noColor: false,
        debug: false,
        args: { }
      },
      single: {
        options: {
          keepAlive: false
        }
      },
      continuous: {
        options: {
          keepAlive: true
        }
      }
    },*/
    /**
     * Local Web server
     */
    connect: {
      options: {
        base: '.',
        hostname: '*',
        port: 8888,
        middleware: function(connect) {
          return [
            function(req, res, next) {
              res.setHeader('Access-Control-Allow-Origin',
                '*');
              res.setHeader('Access-Control-Allow-Methods',
                '*');

              return next();
            },
            connect.static(require('path').resolve('.'))
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
      all: [ 'src/**/*.js' ]
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
    }
  });

  /**
   * Release Tasks
   */
  grunt.registerTask('updmanifests', 'Update manifests.', function() {
    //Update version on manifests files
    var _ = grunt.util._,
      pkg = grunt.file.readJSON('package.json'),
      bower = grunt.file.readJSON('bower.json'),
      version = grunt.option('tag', gitVersion);
    bower = JSON.stringify(_.extend(bower, {
      name: pkg.name,
      version: version
    }), null, 2);
    pkg = JSON.stringify(_.extend(pkg, {
      version: version
    }), null, 2);
    grunt.file.write('package.json', pkg);
    grunt.file.write('bower.json', bower);
  });
  /**
   * Task release: Inspired here: http://kroltech.com/2014/04/use-grunt-to-push-a-git-tag/
   * :patch
   * :minor
   * :major
   */
  grunt.registerTask('release:patch', ['release']);
  grunt.registerTask('release:minor', function() {
    grunt.option('tagType', 'minor');
    grunt.task.run(['release']);
  });
  grunt.registerTask('release:major', function() {
    grunt.option('tagType', 'major');
    grunt.task.run(['release']);
  });
  grunt.registerTask('release', function() {
    if ( grunt.option('tagType') !== 'major' &&
      grunt.option('tagType') !== 'minor' ) {
      grunt.option('tagType', 'patch');
    }
    var resp = readlineSync.question(format('\nRelease [%s] (Y/n)?', grunt.option('tagType')));
    if ( resp.toLowerCase() !== 'y' ) {
      return false;
    }
    var done = this.async();
    child_process.exec('git describe --tags --abbrev=0',
      function( err, stdout, stderr ) {
        if ( stderr ) {
          grunt.log.error(stderr);
        }
        else {
          gitVersion = semver.inc(stdout.trim(), grunt.option('tagType'));
          grunt.option('tag', gitVersion);
          grunt.task.run([
            'exec:test_git_on_master',
            'exec:test_git_is_clean',
            format('step:Release/Update to version %s?', gitVersion),
            'clean:dist',
            'updmanifests',
            'build',
            'exec:git_add',
            format('exec:git_commit:%s', format('Release version %s', gitVersion)),
            'shell:tag:true',
            'shell:remote:true',
            'push'
          ]);
        }
        done();
      }
    );
  });
  grunt.registerTask('push', function() {
    //push to remote
    this.requires('release');
    if ( grunt.option("remote") ) {
      grunt.task.run([
        format('step:Push changes to %s?', grunt.option("remote")),
        'shell:push:true'
      ]);
    }
    else {
      return false;
    }
  });

  /**
   * Test tasks
   */
  grunt.registerTask('test', ['jshint', 'connect', 'mocha', 'watch:mochaunit' ]);

  /**
   * Build Task
   */
  grunt.registerTask('build', ['jshint', 'concat', /*'ngAnnotate',*/ 'uglify', 'sed:version']);
  /**
   * Default
   */
  grunt.registerTask('default', ['build']);
};
