/*!
 * css2stylus.js
 * http://css2stylus.com
 * Copyright (c) 2013 Denis Ciccale (@tdecs)
 * Released under the MIT license
 * https://github.com/dciccale/css2stylus.js/blob/master/LICENSE.txt
 */
(function (window) {
  // Parse @media blocks
  // First: create map for media parameters to a legal class name (i.e. no '(' or '@')
  var mediaDeclarations = [];

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
      var tree = {children: {}};
      var self = this;

      this.css
        // remove comments
        .replace(/\/\*[\s\S]*?\*\//gm, '')

        // Parse @media blocks
        // Second: Remove '@media ... {', remove extra '}', and add mapped 'Media(#)' as a pseudo-class name
        .replace(/@media[^@]+/gi, function (group/* , selector, declaration */) {
          // Remove '@media ... {'  declaration
          var mediaBlockAndCss = group.replace(/@media[^{]+\{/gi, function (group) {
            // Remove final '{' of '@media ... {' and store for later
            mediaDeclarations.push(group.slice(0, -1).trim());
            return '';
          });
          // Add the incremented media pseudo-class
          mediaBlockAndCss = mediaBlockAndCss.replace(/[^\n]+\{/gm, function (group/* , selector, declaration */) {
            // Clever trick from Stack Overflow: http://stackoverflow.com/a/8043061
            var increment = ('00' + mediaDeclarations.length).slice(-3);
            group = 'media' + increment + ' ' + group;
            return group;
          });
          // Remove last '}' of '@media ... { ... }', but first of extra CSS section (Note: don't drop extra CSS)
          mediaBlockAndCss = mediaBlockAndCss.replace(/\}[^{]*\}[^@]*/gi, function (group) {
            // Remove first bracket of extra css following the @media block
            group = group.substring(1);
            // Remove any media pseudo-classes
            group = group.replace(/media\d+\s/gm, '');
            return group;
          });
          return mediaBlockAndCss;
        })

        // process each css block
        .replace(/([^{]+)\{([^}]+)\}/g, function (group, selector, declaration) {
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

            // join special chars to prevent from breaking them into parts
            selector = selector.replace(/\s*([>\+~])\s*/g, ' &$1').replace(/(\w)([:\.])/g, '$1 &$2');

            // split on spaces to get full selector path
            selectors = selector.split(/[\s]+/);

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

      const properties = declaration.split(/\r\n|\n/).map(function (l) {
        return l.replace(/^\s*/, '');
      });
      declaration = properties.map(function (line) {
        return line.replace(/^\s*-\w*-(.*)/, function (wholeMatch, propValue) {
          var pv;

          if (propValues[propValue] || properties.indexOf(propValue) !== -1) {
            pv = '';
          } else {
            propValues[propValue] = 1;
            pv = propValue;
          }

          return pv;
        });
      }).join('\n');

      return declaration;
    },

    _counter: 0,
    _addRule: function (path, selector) {
      var p;

      if (fontface.isFontFace(selector)) {
        selector = fontface.tmpFix(selector);
      }

      p = (path.children[selector] = path.children[selector] || {children: {}, declarations: []});

      return p;
    },

    _depth: 0,
    _generateOutput: function (tree) {
      var output = '';
      var openingBracket = (this.options.openingBracket ? ' ' + this.options.openingBracket : '');
      var key, j, l, declarations, declaration, sel;

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
      output = output.replace(/^\s*$[\n\r]{1,}/gm, '').replace(/\$n/g, '\n'); // .replace(/\n$/, '');

      // Parse @media blocks
      // Third: Replace incremented 'Media(#)' pseudo-class with saved @media declaration
      output = output.replace(/media\d+/gm, function (group) {
        var increment = Number(group.substring(5, 8)) - 1;
        return mediaDeclarations[increment];
      });

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
