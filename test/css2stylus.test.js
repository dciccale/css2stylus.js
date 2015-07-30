'use strict';

var assert = require('assert');

var Css2Stylus = require('../lib/css2stylus');

exports['Should convert CSS into Stylus'] = function (test) {
 var css = 'body { color: red; }';
  var converter = new Css2Stylus.Converter(css);
  converter.processCss();
  var stylusOutput = converter.getStylus();
  test.equal(stylusOutput, 'body\n  color red\n\n');
  test.done();
};
