# [css2stylus.js](http://css2stylus.com) [![NPM version](https://badge.fury.io/js/css2stylus.png)](http://badge.fury.io/js/css2stylus)

JavaScript utility to convert CSS into Stylus.

Node/Browser compatible.

## Demo

###Try it online [css2stylus.com](http://css2stylus.com)

## Usage

### Node

Install the module
```bash
$ npm install -g css2stylus
```

```bash
$ css2stylus

Usage: css2stylus [options] <file1.css> <file2.css>

Supports bash-style piping from stdin to stdout, e.g. `cat myFile.css | css2stylus` outputs myFile.css as stylus. Useful for integrating into an editor of choice.

Examples:
  css2stylus -u -i 4 file1.css         Use 4 space ndent and convert file1.css while unprefixing.
  css2stylus -c file1.css file2.css    Preserve CSS syntax while converting multiple files.


Options:
  -u, --unPrefix   Un-prefix any property with vendor prefixes.
  -c, --cssSyntax  Keep CSS syntax punctuation.
  -f, --force      Overwrite existing .styl files
  -i, --indent     Set indentation level
```

Convert any css file:

```bash
$ css2stylus myfile.css
```

The output will be saved to `myfile.styl`.

The binary is also capable of piping from stdin, stdout.
This is useful for integrating the binary with Vim or another editor of your choice.

Vim mapping to convert the selected CSS text to stylus:
```
" CSS2Stylus
:vnoremap <leader>cs :!css2stylus -u -i 4<cr><esc>
```


### Browser

```html
<!doctype html>
  <title>Demo</title>
  <script src="css2stylus.js"></script>
  <script>
  (function () {
    var css = 'body { color: red; }';
    var converter = new Css2Stylus.Converter(css);
    converter.processCss();
    // output
    var stylus_output = converter.getStylus();
    // body
    //   color red
  }());
  </script>
```

## Keep CSS syntax
To keep CSS punctuation `{:;}` just pass `--cssSyntax` option from command line.

Or pass options object when processing a CSS file from JavaScript `converter.processCss({ cssSyntax: true });`

## nib support
Unprefix any CSS snippet with vendor prefixes by passing `--unPrefix` option from command line.

Or pass an options object when processing a CSS file from JavaScript `converter.processCss({ unPrefix: true });`

## License
See [LICENSE.txt](https://raw.github.com/dciccale/css2stylus.js/master/LICENSE.txt)
