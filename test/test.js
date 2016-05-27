var search    = require("../index.js");
var _         = require("underscore");
var numeral   = require("numeraljs");
var extractor = require("unfluff");

numeral.language('fr', {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
    },
    ordinal : function (number) {
        return number === 1 ? 'er' : 'ème';
    },
    currency: {
        symbol: '€'
    }
});

numeral.language('fr');


var options = {
    host : "google.fr",
    num : 20,
    qs: {
        q: "comment choisir un champagne",
        pws : 0,
        //lr : "lang_fr" //,
        //cr : "BE"
    },
    nbrGrams : [1,2,3],
    withStopWords : false,
    language : 'fr',
    removeSpecials : true,
    removeDiacritics : true
    //,proxy
};



describe("Generate corpus", function() {

  it.skip('test unfluff with bad HTML code', function(){
      var content = "<html><body><p>Conditions d'utilisation<b class='hideforacc'>du Service de livraison internationale - la page s'ouvre dans une nouvelle fenêtre ou un nouvel onglet</b></p></body></html>";
      content = content.replace(/(<b([^>]+)>)/ig, " ");
      content = extractor(content, "fr").text;
      console.log(">>", content);
  });

  it('Generate Corpus', function(done) {
    this.timeout(1000000);
    search.generateCorpus(options, function(error, corpus){

        if (error) {
          console.log(error);
          done();
        }

        console.log("Word;Nbr Docs;TF Avg;TF Min;TF Max;IDF Avg;TF.IDF Sum;TF.IDF Avg");
        var sorted = null;
        // if ngrGrams is an array
        if (_.isArray(corpus)) {

            var allWords = Array.from(corpus[0].stats.values()).concat(Array.from(corpus[1].stats.values()).concat(Array.from(corpus[2].stats.values())));
            sorted = _.sortBy(allWords, function(word) { return -word.tfIdfSum;});

            sorted.forEach(function (word){
                  //if (word.nbrDocs > 1) {
                    console.log(word.word + ";" + word.nbrDocs + ";" +
                                  numeral(word.tfAvg).format("0.00")  + ";" +
                                  numeral(word.tfMin).format("0.00")  + ";" +
                                  numeral(word.tfMax).format("0.00")  + ";" +
                                  numeral(word.idfAvg).format("0.00")   + ';' +
                                  numeral(word.tfIdfSum).format("0.00")  + ';' +
                                  numeral(word.tfIdfAvg).format("0.00"));
                  //}

            });

        }
        else {

            sorted = _.sortBy(Array.from(corpus.stats.values()), function(word) { return -word.tfIdfSum;});

            sorted.forEach(function (word){
              if (word.nbrDocs > 1) {
                console.log(word.word + ";" + word.nbrDocs + ";" +
                              numeral(word.tfAvg).format("0.00")  + ";" +
                              numeral(word.tfMin).format("0.00")  + ";" +
                              numeral(word.tfMax).format("0.00")  + ";" +
                              numeral(word.idfAvg).format("0.00")   + ';' +
                              numeral(word.tfIdfSum).format("0.00")  + ';' +
                              numeral(word.tfIdfAvg).format("0.00"));
              }
            });

        }



        done();

  });
});


});
