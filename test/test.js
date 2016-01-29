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
        q: "rachat+crédit",
        num : 15,
        pws : 0,
        lr : "lang_fr" //,
        //cr : "BE"
    },
    nbrGrams : 2,
    withStopWords : false,
    language : 'fr'
    //,proxy
};



describe("Generate corpus", function() {


  it('Generate Corpus', function(done) {
    this.timeout(100000);
    search.generateCorpus(options, function(error, corpus){

        if (error) {
          console.log(error);
          done();
        }

        var sorted = _.sortBy(Array.from(corpus.stats.values()), function(word) { return -word.tfIdfSum;});


        console.log("Word;Nbr Docs;TF Avg;TF Min;TF Max;IDF Avg;TF.IDF Sum;TF.IDF Avg");
        sorted.forEach(function (word){
            console.log(word.word + ";" + word.nbrDocs + ";" +
                          numeral(word.tfAvg).format("0.00")  + ";" +
                          numeral(word.tfMin).format("0.00")  + ";" +
                          numeral(word.tfMax).format("0.00")  + ";" +
                          numeral(word.idfAvg).format("0.00")   + ';' +
                          numeral(word.tfIdfSum).format("0.00")  + ';' +
                          numeral(word.tfIdfAvg).format("0.00"));
        });
        done();

  });
});


});
