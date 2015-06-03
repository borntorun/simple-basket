/**
 * Created by Joao Carvalho on 18-05-2015.
 */
  //gruntfile.js
module.exports = function( grunt ) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: true,
        multistr: true,
        '-W030': true
      },
      build: ['Grunfile.js', 'src/**/*.js', 'tests/**/*_spec.js']
    }
  });

  grunt.registerTask('default', ['jshint']);
};
