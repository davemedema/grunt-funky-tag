/*
 * grunt-funky-tag
 * https://github.com/davemedema/grunt-funky-tag
 *
 * Copyright (c) 2013 Dave Medema
 * Licensed under the MIT license.
 */

'use strict';

var shell = require('shelljs');
var semver = require('semver');

/**
 * Executes a shell command.
 *
 * @param {String} command
 */
function exec(command) {
  return shell.exec(command, { silent: true });
}

// Repo utilities
var repo = {

  /**
   * Checks whether a repo exists.
   *
   * @return {Boolean}
   */
  exists: function() {
    return (exec('git status').code === 0);
  },
  
  /**
   * Returns the highest tag in the repo.
   *
   * @return {String}
   */
  getHighestTag: function() {
    var highestTag = '0.0.0';
    var tags = exec('git tag');

    if (tags.code !== 0) return highestTag;

    tags = tags.output.split('\n');
    tags.forEach(function(tag) {
      tag = semver.valid(tag);
      if (tag && (!highestTag || semver.gt(tag, highestTag))) {
        highestTag = tag;
      }
    });

    return highestTag;
  },

  /**
   * Checks if the repo is clean.
   *
   * @return {Boolean}
   */
  isClean: function() {
    return (exec('git diff-index --quiet HEAD --').code === 0);
  }
};

/**
 * Exports.
 *
 * @param {Object} grunt
 */
module.exports = function(grunt) {

  /**
   * Displays `message` and aborts Grunt. Optionally logs `error`.
   *
   * @param {String} message
   * @param {Mixed} error
   */
  function fail(message, error) {
    if (error) grunt.log.error(error);
    grunt.fail.warn(message || 'Task failed.');
  }

  // Register task
  grunt.registerTask('funky_tag', 'Commit and tag.', function() {
    var pkg = grunt.config('pkg');
    var tag = pkg.version;

    // Make sure we have a valid tag
    if (!semver.valid(tag)) {
      fail('"' + tag + '" is not a valid semantic version.');
    }

    // Make sure have a repository
    if (!repo.exists()) {
      fail('Repository not found.');
    }

    // Validate tag
    var highestTag = repo.getHighestTag();

    if (highestTag && !semver.gt(tag, highestTag)) {
      fail('"' + tag + '" is lower or equal than the current highest tag "' + highestTag + '".');
    }

    // Commit
    if (!repo.isClean()) {
      exec('git add .');
      if (exec('git commit -a -m "' + tag + '"').code === 0) {
        grunt.log.ok('Committed as: ' + tag);
      }
    }

    // Tag
    var tagCmd = exec('git tag v' + tag);

    if (tagCmd.code !== 0) {
      fail('Couldn\'t tag the last commit.', tagCmd.output);
    } else {
      grunt.log.ok('Tagged as: ' + tag);
    }
  });

};
