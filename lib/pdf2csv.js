//pdf2csv.js


exports.pdf2csv = function(pdfBuffer, csvname){
  return new Promise((resolve, reject) => {
    var PFParser = require('pdf2json'),
        _ = require('underscore');

    var pdfParser = new PFParser();
    var self = {};

    function urldecode(url) {
      return decodeURIComponent(url.replace(/\+/g, ' '));
    }

    function getText(marks, ex, ey, v) {
      var x = marks[0].x;
      var y = marks[0].y;

      var txt = '';
      for (var i = 0; i < marks.length; i++) {
        var c = marks[i];
        var dx = c.x - x;
        var dy = c.y - y;

        if (Math.abs(dy) > ey) {
          txt += "\"\n\"";
          if (marks[i+1]) {
            // line feed - start from position of next line
            x = marks[i+1].x;
          }
        } else {
          if (Math.abs(dx) > ex) {
            txt += "\",\"";
          }
        }

        var cell = '';
        for (var j = 0; j < c.R.length; j++) {
          cell += c.R[j].T;
        }
        txt += urldecode(cell);

        x = c.x;
        y = c.y;
      }

      return txt;
    }

    function csv(pages) {
      var res = '"';
      for (var i = 0; i < pages.length; i++) {
        res += getText(pages[i].Texts, 1, 0.5, false);
      }
      return res + '"';
    }

    function ready(x) {
      var texts = x.formImage.Pages[0].Texts;

      var output = csv(x.formImage.Pages);
      resolve(output);
    }

    function error(e) {
      reject(e);
    }

    pdfParser.on("pdfParser_dataReady", _.bind(ready, self));
    pdfParser.on("pdfParser_dataError", _.bind(error, self));

    pdfParser.parseBuffer(pdfBuffer);

  });
}
