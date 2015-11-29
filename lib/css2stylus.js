/*!
 * css2stylus.js
 * http://css2stylus.com
 * Copyright (c) 2013 Denis Ciccale (@tdecs)
 * Released under the MIT license
 * https://github.com/dciccale/css2stylus.js/blob/master/LICENSE.txt
 */
(function (window) {

  // use global as window in node
  if (typeof global === 'object' && global && global.global === global) {
    window = global;
  }

  // handle @font-face declarations
  var fontface = {
    counter: 0,
    isFontFace: function (selector) {
      return selector.match('@font-face');
    },
    tmpFix: function (selector) {
      var sel = selector + this.counter;
      this.counter++;
      return sel;
    },
    tmpUnFix: function (selector) {
      return selector.replace(/\d+$/, '');
    }
  };

  var Css2Stylus = {
    // constructor
    Converter: function (css) {
      this.css = css || '';
      this.output = '';
      return this;
    }
  };

  Css2Stylus.Converter.prototype = {

    // default options
    defaults: {
      // possible indent values: 'tab' or number (of spaces)
      indent: '2',
      cssSyntax: false,
      openingBracket: '',
      closingBracket: '',
      semicolon: '',
      eol: '',
      unPrefix: false,
      keepColons: false
    },

    processCss: function (options) {
      if (!this.css) {
        return this.css;
      }

      this.options = this._extend({}, this.defaults, options);

      // keep css punctuation
      if (this.options.cssSyntax === true) {
        this.options.openingBracket = '{';
        this.options.closingBracket = '}';
        this.options.semicolon = ':';
        this.options.eol = ';';
      } else if (this.options.cssSyntax === false) {
        this.options.semicolon = this.options.keepColons ? ':' : '';
      }

      // indentation
      if (this.options.indent === 'tab') {
        this.indentation = '\t';
      } else {
        this.indentation = this._repeat(' ', this.options.indent);
      }

      // parse css
      this._parse();

      return this;
    },

    _parse: function () {
      var tree = { children: {} };
      var self = this;

      this.css
        // remove comments
        .replace(/\/\*[\s\S]*?\*\//gm, '')
        // process each css block
        .replace(/([^{]+)\{([^}]+)\}/g, function (group, selector, declaration) {
          // console.log(selector);
          var i, l, _sel,
            path = tree,
            selectors;

          // remove prefixes
          if (self.options.unPrefix) {
            declaration = self._unPrefix(declaration);
          }

          selector = self._trim(selector);

          // skip grouped selector
          if (/,/.test(selector)) {
            path = self._addRule(path, selector);

          // process
          } else {
            // Begin modified code for @media
            // Remove '{' when appears in multiple @media declarations
            selector = selector.replace(/}*/g, '');
            // console.log('Selector: ' + selector);

            // Original Code:
            // Join special chars to prevent from breaking them into parts, but account for @media
            // selector = selector.replace(/\s*([>\+~])\s*/g, ' &$1').replace(/(\w)([:\.])/g, '$1 &$2');
            selector = selector.replace(/\s*([>\+~])\s*/g, ' &$1')
            // console.log('MidResult: ' + selector);
            if( selector.match(/@media/gi) ) {
              // Prevent parsing by space after :
              selector = selector.replace(/(\s)/g, '');
            } else {
              // For :hover or other classes
              selector = selector.replace(/(\w)([:\.])/g, '$1 &$2');
            }
            // console.log('EndResult: ' + selector);

            // split on spaces to get full selector path
            selectors = selector.split(/[\s]+/);
            // console.log('Split selectors: ' + selectors);

            for (i = 0, l = selectors.length; i < l; i++) {
              // fix back special chars
              _sel = selectors[i].replace(/&(.)/g, '& $1 ').replace(/& ([:\.]) /g, '&$1');
              path = self._addRule(path, _sel);
            }
          }

          declaration.replace(/([^:;]+):([^;]+)/g, function (_declaration, property, value) {
            path.declarations.push({
              property: self._trim(property),
              value: self._trim(value)
            });
          });
        });

      this.output = this._generateOutput(tree);
    },

    _unPrefix: function (declaration) {
      var propValues = {};

      declaration = declaration.replace(/-\w*-(.*)/g, function (wholeMatch, propValue) {
        if (propValues[propValue]) {
          return '';
        } else {
          propValues[propValue] = 1;
          return propValue;
        }
      })
        .replace(/^(.*)[\s\n]+\1/gm, '$1');

      return declaration;
    },

    _counter: 0,
    _addRule: function (path, selector) {
      if (fontface.isFontFace(selector)) {
        selector = fontface.tmpFix(selector);
      }
      return (path.children[selector] = path.children[selector] || { children: {}, declarations: [] });
    },

    _depth: 0,
    _generateOutput: function (tree) {
      var output = '', key, j, l, declarations, declaration,
        openingBracket = (this.options.openingBracket ? ' ' + this.options.openingBracket : ''),
        sel;

      for (key in tree.children) {
        if (tree.children.hasOwnProperty(key)) {
          sel = key;
          if (fontface.isFontFace(key)) {
            sel = fontface.tmpUnFix(key);
          }
          output += this._getIndent() + sel + openingBracket + '\n';
          this._depth++;
          declarations = tree.children[key].declarations;

          for (j = 0, l = declarations.length; j < l; j++) {
            declaration = declarations[j];
            output += this._getIndent() + declaration.property + this.options.semicolon + ' ' + declaration.value + this.options.eol + '\n';
          }

          output += this._generateOutput(tree.children[key]);
          this._depth--;
          output += this._getIndent() + this.options.closingBracket + '\n' + (this._depth === 0 ? '$n' : '');
        }
      }

      // remove blank lines (http://stackoverflow.com/a/4123442)
      output = output.replace(/^\s*$[\n\r]{1,}/gm, '').replace(/\$n/g, '\n')//.replace(/\n$/, '');

      return output;
    },

    // calculate correct indent
    _getIndent: function () {
      return this._repeat(this.indentation, this._depth);
    },

    // returns stylus output
    getStylus: function () {
      return this.output;
    },

    // string helpers
    _trim: function (str) {
      // _trim tabs and spaces
      return str.replace(/\t+/, ' ').replace(/^\s+|\s+$/g, '');
    },

    // _repeat same string n times
    _repeat: function (str, n) {
      n = window.parseInt(n, 10);
      return new Array(n + 1).join(str);
    },

    // extend objects
    _extend: function () {
      for (var i = 1; i < arguments.length; i++) {
        for (var key in arguments[i]) {
          if (arguments[i].hasOwnProperty(key)) {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
      return arguments[0];
    }
  };

  // expose to global
  window.Css2Stylus = Css2Stylus;

  // expose as node module
  if (typeof module === 'object' && module && module.exports === exports) {
    module.exports = Css2Stylus;

  // expose as an AMD module
  } else if (typeof window.define === 'function' && window.define.amd) {
    window.define('css2stylus', [], function () {
      return window.Css2Stylus;
    });
  }

}).call(this, this);
