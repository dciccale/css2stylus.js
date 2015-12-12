/*!
 * css2stylus.js
 * http://css2stylus.com
 * Copyright (c) 2013 Denis Ciccale (@tdecs)
 * Released under the MIT license
 * https://github.com/dciccale/css2stylus.js/blob/master/LICENSE.txt
 */
(function (window) {
  // Used only for debugging the tree
  var jsonfile = require('jsonfile')

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

  // handle @media declarations
  var MediaFix = {
    counter: 0,
    ismedia: function (selector) {
      return selector.match('@media');
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

  // Remove trailing whitespace and brackets (used in @media-parser)
  function TrimBrackets(str) {
    // Remove brackets and whitespace
    var result = str.replace(/\s*\{*\s\}*\s*/gi, '');
    // Strip away content from step 1
    result = result.replace(/\s*%11%\s*/gi, '');
    return result;
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

      // var MediaTemp = tree;
      // MediaTemp.declarations = { property: [], value: [], MediaType: [] };

      // var CSSWithoutMedia = this.css
      //   // remove comments
      //   .replace(/\/\*[\s\S]*?\*\//gm, '')

      //   // Identify @media declaration
      //   // Then Remove @media declaration and modify for later cleanup??
      //   .replace(/@media[^@]+/gi, function (group, selector, declaration) {
      //     // Display what was filtered
      //     console.log('## 1. Net Group: ##');
      //     console.log(group);

      //     // Step 0: Configure workspace with string inside of @media block
      //     var MediaSelector = /@media[^{]+/.exec(group)[0];

      //     // Step 1: Identify each { ... } and save block
      //     var output = group.replace(/\{[^{]+}/g, function (group) {
      //       group = TrimBrackets(group);
      //       // console.log('## 2. block group: ##');
      //       // console.log(group);

      //       // Save by pushing into grandchildren class of path?
      //       // MediaTemp.grandchildren.push( self._trim(group) );
      //       MediaTemp.declarations.value.push( group );
      //       MediaTemp.declarations.MediaType.push(MediaSelector);
      //       // path.declarations.push({
      //       //   property: self._trim(property),
      //       //   value: self._trim(value),
      //       //   media: '(max-width: 767px) '
      //       // });

      //       return '%11%'
      //     });
      //     // console.log('## Step 1. Output ##');
      //     // console.log(output);

      //     // Identify each '[selector] %11%' from step 1
      //     var output = output.replace(/[^(%11%){\n]+%11%/g, function (group) {
      //       group = TrimBrackets(group);
      //       // console.log('## 2. selector group: ##');
      //       // console.log(group);

      //       // Save by pushing into grandselector class of path?
      //       MediaTemp.declarations.property.push(group);

      //       return '%22%'
      //     });
      //     // console.log('## Step 2. Output ##');
      //     // console.log(output);

      //     // // // // // // // // // // // // // // // // // // // // // // // // // //
      //     // NOTE!
      //     // Address any content not inside the '@media ... {...}' declaration
      //     // Return excess content and excise '@media ... {...}' from the css code
      //     // // // // // // // // // // // // // // // // // // // // // // // // // //

      //     // Note: Removes the '@media ... { ... } ... [^@]'
      //     return ' '
      //   })

      this.css
        // remove comments
        .replace(/\/\*[\s\S]*?\*\//gm, '')

        // Identify @media declaration
        // Then Remove @media declaration and replace with @font-face...eh? Won't work... :(
        // .replace(/@media[^{]+\{/gi, function (group, selector, declaration) {
        //   // Display what was filtered
        //   console.log('## 1. Net Group: ##');
        //   console.log(group);

        //   return '@font-face  {'
        // })
        // Identify @media declaration and create a work around
        .replace(/@media[^@]+/gi, function (group, selector, declaration) {
          // Remove '@media ... {'  declaration
          var MediaLess = group.replace(/@media[^{]+\{/gi, function (group) {
            console.log('## @media');
            console.log(group);
            return ''
          });
          // Remove last '}' and keep extra css (literally in the case of the test)
          MediaLess = MediaLess.replace(/\}[^{]*\}[^@]*/gi, function (group) {
            // Remove first bracket
            group = group.substring(1);
            console.log('## removed extra }');
            console.log(group);
            return group
          });
          console.log('## MediaLess');
          console.log(MediaLess);
          return MediaLess
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

      // Debug Tree
      jsonfile.writeFile('./tmp/data.json', tree, {spaces: 1}, function (err) {
        console.error(err)
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
      else if (MediaFix.ismedia(selector)) {
        selector = MediaFix.tmpFix(selector);
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
