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

Convert any css file:
```bash
$ css2stylus myfile.css
```

The output will be saved to `myfile.styl`.

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
