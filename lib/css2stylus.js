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

  var Css2Stylus = {
    // constructor
    Converter: function (css) {
      this.css = css || '';
      this.output = '';
      return this;
    }
  };

  Css2Stylus.Converter.prototype = Css2Stylus.prototype = {

    // default options
    options: {
      // possible indent values: 'tab' or number (of spaces)
      indent: 2,
      cssSyntax: false,
      openingBracket: '',
      closingBracket: '',
      semicolon: '',
      eol: '',
      unPrefix: false
    },

    processCss: function (options) {
      if (!this.css) {
        return this.css;
      }
      options = options || {};

      if (options.indent) {
        this.options.indent = options.indent;
      }

      // keep css punctuation
      if (options.cssSyntax === true) {
        this.options.openingBracket = '{';
        this.options.closingBracket = '}';
        this.options.semicolon = ':';
        this.options.eol = ';';
      } else if (options.cssSyntax === false) {
        this.options.openingBracket = '';
        this.options.closingBracket = '';
        this.options.semicolon = '';
        this.options.eol = '';
      }

      // indentation
      if (this.options.indent === 'tab') {
        this.indentation = '\t';
      } else {
        this.indentation = this.repeat(' ', this.options.indent);
      }

      // keep or remove vendor prefixes
      this.options.unPrefix = options.unPrefix || false;

      // actualy parse css
      this.parse();

      return this;
    },

    parse: function () {
      var tree = { children: {} },
        self = this;


      this.css
        // remove comments
        .replace(/\/\*[\s\S]*?\*\//gm, '')
        // process each css block
        .replace(/([^{]+)\{([^}]+)\}/g, function (group, selector, declaration) {
          var i, l, _sel,
            path = tree,
            selectors;

          // remove prefixes
          if (self.options.unPrefix) {
            declaration = self.unPrefix(declaration);
          }

          selector = self.trim(selector);

          // skip grouped selector
          if (/,/.test(selector)) {
            path = self.addRule(path, selector);

          // process
          } else {

            // join special chars to prevent from breaking them into parts
            selector = selector.replace(/\s*([>\+~])\s*/g, ' &$1').replace(/(\w)([:\.])/g, '$1 &$2');

            // split on spaces to get full selector path
            selectors = selector.split(/[\s]+/);

            for (i = 0, l = selectors.length; i < l; i++) {
              // fix back special chars
              _sel = selectors[i].replace(/&(.)/g, '& $1 ').replace(/& ([:\.]) /g, '&$1');
              path = self.addRule(path, _sel);
            }
          }

          declaration.replace(/([^:;]+):(.+);$/mg, function (_declaration, property, value) {
            path.declarations.push({
              property: self.trim(property),
              value: self.trim(value)
            });
          });
        });

      this.output = this.generateOutput(tree);
    },

    unPrefix: function (declaration) {
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

    addRule: function (path, selector) {
      return (path.children[selector] = path.children[selector] || { children: {}, declarations: [] });
    },

    depth: 0,
    generateOutput: function (tree) {
      var output = '', key, j, l, declarations, declaration,
        openingBracket = (this.options.openingBracket ? ' ' + this.options.openingBracket : '');


      for (key in tree.children) {
        if (tree.children.hasOwnProperty(key)) {
          output += this.getIndent() + key + openingBracket + '\n';
          this.depth++;
          declarations = tree.children[key].declarations;

          for (j = 0, l = declarations.length; j < l; j++) {
            declaration = declarations[j];
            output += this.getIndent() + declaration.property + this.options.semicolon + ' ' + declaration.value + this.options.eol + '\n';
          }

          output += this.generateOutput(tree.children[key]);
          this.depth--;
          output += this.getIndent() + this.options.closingBracket + '\n' + (this.depth === 0 ? '$n' : '');
        }
      }

      // remove blank lines (http://stackoverflow.com/a/4123442)
      output = output.replace(/^\s*$[\n\r]{1,}/gm, '').replace(/\$n/g, '\n')//.replace(/\n$/, '');

      return output;
    },

    // calculate correct indent
    getIndent: function () {
      return this.repeat(this.indentation, this.depth);
    },

    // returns stylus output
    getStylus: function () {
      return this.output;
    },

    // string helpers
    trim: function (str) {
      // trim tabs and spaces
      return str.replace(/\t+/, ' ').replace(/^\s+|\s+$/g, '');
    },

    // repeat same string n times
    repeat: function (str, n) {
      n = window.parseInt(n, 10);
      return new Array(n + 1).join(str);
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
