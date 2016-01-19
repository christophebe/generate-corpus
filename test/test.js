var search  = require("../index.js");
var _       = require("underscore");
var numeral = require("numeraljs");

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
    host : "google.be",
    qs: {
        q: "courtier crédit",
        num : 15
    },
    nbrGrams : 1,
    withStopWords : false,
    language : 'fr'
    //,proxy
};


describe("Generate corpus", function() {


  it('Generate Corpus', function(done) {
    this.timeout(40000);
    search.generateCorpus(options, function(error, corpus){

        if (error) {
          console.log(error);
          done();
        }

        console.log(corpus);
        console.log("----------------------------------------------");
        console.log(corpus.stats.words['prêt']);
        console.log("----------------------------------------------");
        var result = [];
        _.keys(corpus.stats.words).forEach(function(word) {
          result.push({word : word,
                       nbrDocsByWords : corpus.stats.nbrDocsByWords[word],
                       tfAvg : corpus.stats.words[word].tfAvg,
                       tfMin : corpus.stats.words[word].tfMin,
                       tfMax : corpus.stats.words[word].tfMax,
                       idfAvg : corpus.stats.words[word].idfAvg,
                       tfIdfSum : corpus.stats.words[word].tfIdfSum,
                       tfIdfAvg : corpus.stats.words[word].tfIdfAvg
                     });
        });

        result = _.sortBy(result, function(word) { return -word.tfIdfSum;});

        console.log("Word;Nbr Docs;TF Avg;TF Min;TF Max;IDF Avg;TF.IDF Sum;TF.IDF Avg");
        result.forEach(function (word){
          console.log(word.word + ";" + word.nbrDocsByWords + ";" +
                      numeral(word.tfAvg).format("0.00")  + ";" +
                      numeral(word.tfMin).format("0.00")  + ";" +
                      numeral(word.tfMax).format("0.00")  + ";" +
                      numeral(word.idfAvg).format("0.00")   + ';' +
                      numeral(word.tfIdfSum).format("0.00")  + ';' +
                      numeral(word.tfIdfAvg).format("0.00") );
        });
        done();

  });
});


});
