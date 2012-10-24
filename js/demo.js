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

  $('#main input[type="radio"]').change(function () {
    var options = {
      indent: $(this).val()
    }
    convert(options);
  });
});