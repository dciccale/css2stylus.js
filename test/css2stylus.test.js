'use strict';

var assert = require('assert');

var Css2Stylus = require('../lib/css2stylus');
var fs = require('fs');

// Shorthand for repeated test scripts
function RunTest(test, FileName, debug) {
  var css = fs.readFileSync('./test/fixture/' + FileName + '.css').toString();
  var styl = fs.readFileSync('./test/expected/' + FileName + '.styl').toString();
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
// exports['Should convert CSS into Stylus'] = function (test) {
//   var css = 'body { color: red; }';
//   var converter = new Css2Stylus.Converter(css);
//   converter.processCss();
//   var stylusOutput = converter.getStylus();
//   test.equal(stylusOutput, 'body\n  color red\n\n');
//   test.done();
// };
// exports['Should handle :hover'] = function (test) {
//   RunTest(test, 'hover', true);
// };
// exports['Should handle multiple @font-face declarations'] = function (test) {
//   RunTest(test, 'font-face', true);
// };
exports['Should handle @media declarations'] = function (test) {
  RunTest(test, 'media', true);
};
// exports["Should handle denis' example"] = function (test) {
//   RunTest(test, 'denis', true);
// };
