'use strict';

var Css2Stylus = require('../lib/css2stylus');
var fs = require('fs');

// Shorthand for repeated test scripts
function runTest(test, fileName, debug) {
  var css = fs.readFileSync('./test/fixture/' + fileName + '.css').toString();
  var styl = fs.readFileSync('./test/expected/' + fileName + '.styl').toString();
  var converter = new Css2Stylus.Converter(css);
  converter.processCss();
  var output = converter.getStylus();
  if (debug) {
    console.log('    ');
    console.log('### Output ###');
    console.log(output);
  }
  test.equal(output, styl);
  test.done();
}

// List of unit tests
exports['Should convert CSS into Stylus'] = function (test) {
  var css = 'body { color: red; }';
  var converter = new Css2Stylus.Converter(css);
  converter.processCss();
  var stylusOutput = converter.getStylus();
  test.equal(stylusOutput, 'body\n  color red\n\n');
  test.done();
};

exports['Should handle :hover'] = function (test) {
  runTest(test, 'hover', false);
};

exports['Should handle multiple @font-face declarations'] = function (test) {
  runTest(test, 'font-face', false);
};

exports['Should handle @media declarations'] = function (test) {
  runTest(test, 'media', false);
};

exports['Tested code posted to Github Issue'] = function (test) {
  runTest(test, 'GithubIssue', false);
};
