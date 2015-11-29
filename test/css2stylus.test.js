'use strict';

var assert = require('assert');

var Css2Stylus = require('../lib/css2stylus');
var fs = require('fs');

exports['Should convert CSS into Stylus'] = function (test) {
 var css = 'body { color: red; }';
  var converter = new Css2Stylus.Converter(css);
  converter.processCss();
  var stylusOutput = converter.getStylus();
  test.equal(stylusOutput, 'body\n  color red\n\n');
  test.done();
};

exports['Should handle :hover'] = function (test) {
  var css = fs.readFileSync('./test/fixture/hover.css').toString();
  var styl = fs.readFileSync('./test/expected/hover.styl').toString();
  var converter = new Css2Stylus.Converter(css);
  converter.processCss();
  var output = converter.getStylus();
  // console.log(output);
  test.equal(output, styl);
  test.done();
};

exports['Should handle multiple @font-face declarations'] = function (test) {
  var css = fs.readFileSync('./test/fixture/font-face.css').toString();
  var styl = fs.readFileSync('./test/expected/font-face.styl').toString();
  var converter = new Css2Stylus.Converter(css);
  converter.processCss();
  var output = converter.getStylus();
  // console.log(output);
  test.equal(output, styl);
  test.done();
};

exports['Should handle @media declarations'] = function (test) {
  var css = fs.readFileSync('./test/fixture/media.css').toString();
  var styl = fs.readFileSync('./test/expected/media.styl').toString();
  var converter = new Css2Stylus.Converter(css);
  converter.processCss();
  var output = converter.getStylus();
  console.log(output);
  test.equal(output, styl);
  test.done();
};
