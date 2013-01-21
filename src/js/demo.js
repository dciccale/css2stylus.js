$(function () {
  var input = $('#input');
  var output = $('#output');
  var convert = function (options) {
    var css = input.val();
    if (!css) return;
    var converter = new Css2Stylus.Converter(css);
    converter.processCss(options);
    output.val(converter.getStylus());
  }

  $('#input').keyup(convert);

  $('#selectall').click(function () {
    output.select();
  });

  $('#main input[name="indentation"]').change(function () {
    convert({ indent: this.value });
  });

  $('#unprefix').change(function () {
    convert({ unPrefix: this.checked });
  });

  $.get('js/demo.css', function (css) {
    $('#loadsample').click(function () {
      input.val(css);
      convert();
    });
  });
});

// use css3 github ribbon or fallback
(function(){var c=document.createElement("div"),d=["webkit","moz","o","ms"];l=d.length;var b=document.createElement("div"),a;(function(a){if(a in c.style)return!0;for(a=a.replace(/^[a-z]/,function(a){return a.toUpperCase()});l--;)if(d[l]+a in c.style)return!0;return!1})("transform")?(a=document.createElement("link"),a.rel="stylesheet",a.href="http://fonts.googleapis.com/css?family=Lato:700&amp;text=ForkmenGithub",document.head.appendChild(a),a='<a href="https://github.com/dciccale/css2stylus.js" class="github-ribbon">Fork me on GitHub</a><a class="github-ribbon-msg" href="https://github.com/dciccale/css3-github-ribbon">CSS3 Github Ribbon</a>'):a='<a href="https://github.com/dciccale/css2stylus.js"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png" alt="Fork me on GitHub" /></a>';b.innerHTML=a;document.body.appendChild(b.children[0]);b.children[0]&&document.body.appendChild(b.children[0])})();
