module.exports = {
  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '',


  // frameworks to use
  // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
  frameworks: [
    'chai',
    'mocha',
    'fixture',
    'browserify',
  ],


  // list of files / patterns to load in the browser
  files: [
    'bower_components/lodash/lodash.js',
    'bower_components/jquery/dist/jquery.js',
    'dist/onion-sticky.browserify-shim.debug.js',
    'test/*.js',
    'test/*.html'
  ],


  // list of files to exclude
  exclude: [
  ],


  // preprocess matching files before serving them to the browser
  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  preprocessors: {
    '**/*.html'   : ['html2js'],
  },


  // test results reporter to use
  // possible values: 'dots', 'progress'
  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  reporters: ['html', 'progress'],

  client: {
    mocha: {
      reporter: 'html',
      ui: 'bdd'
    }
  },

  // web server port
  port: 9876,


  // enable / disable colors in the output (reporters and logs)
  colors: true,


  // enable / disable watching file and executing tests whenever any file changes
  autoWatch: true,


  // Continuous Integration mode
  // if true, Karma captures browsers, runs the tests and exits
  singleRun: false
};
