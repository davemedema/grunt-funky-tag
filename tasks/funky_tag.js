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

function exec(command) {
  return shell.exec(command, { silent: true });
}

var git = {
  exists: function() {
    return (exec('git status').code === 0);
  },
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
  isClean: function() {
    return (exec('git diff-index --quiet HEAD --').code === 0);
  }
};

module.exports = function(grunt) {

  function fail(message, error) {
    if (error) grunt.log.error(error);
    grunt.fail.warn(message || 'Task failed.');
  }

  grunt.registerTask('funky_tag', function () {
    var pkg = grunt.config('pkg');
    var tag = pkg.version;

    // Make sure we have a valid tag
    if (!semver.valid(tag)) {
      fail('"' + tag + '" is not a valid semantic version.');
    }

    // Make sure have a repository
    if (!git.exists()) {
      fail('Repository not found.');
    }

    // Validate tag
    var highestTag = git.getHighestTag();

    if (highestTag && !semver.gt(tag, highestTag)) {
      fail('"' + tag + '" is lower or equal than the current highest tag "' + highestTag + '".');
    }

    // Commit
    if (!git.isClean()) {
      if (exec('git add .').code === 0) {
        grunt.log.writeln('All file contents added to the index.');
      }
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
