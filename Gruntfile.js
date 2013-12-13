'use strict';

module.exports = function(grunt) {

  // Config
  // ---

  grunt.initConfig({

    // package.json
    pkg: grunt.file.readJSON('package.json'),

    // `clean`
    clean: {
      test: ['tmp']
    },

    // `jshint`
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'tasks/**/*.js',
        'test/**/*_test.js'
      ]
    },

    // `nodeunit`
    nodeunit: {
      files: ['test/**/*_test.js']
    }
  });

  // Load tasks
  // ---

  grunt.loadTasks('tasks');

  // Load npm tasks
  // ---

  require('load-grunt-tasks')(grunt);

  // Task aliases
  // ---

  grunt.registerTask('default', ['test']);

  grunt.registerTask('release', function(type) {
    grunt.task.run('test');
    grunt.task.run('bump:' + (type || 'patch'));
    grunt.task.run('tag');
  });

  grunt.registerTask('test', ['clean', 'jshint', 'nodeunit']);
  grunt.registerTask('t', ['test']);

};
