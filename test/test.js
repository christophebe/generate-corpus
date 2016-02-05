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
    host : "google.fr",
    qs: {
        q: "jardinage",
        num : 50,
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


  it('Generate Corpus', function(done) {
    this.timeout(1000000);
    search.generateCorpus(options, function(error, corpus){

        if (error) {
          console.log(error);
          done();
        }

        console.log("Word;Nbr Docs;TF Avg;TF Min;TF Max;IDF Avg;TF.IDF Sum;TF.IDF Avg");
        var sorted = null;
        if (_.isArray(corpus)) {
            corpus.forEach(function (c){
                console.log("----------------------------------------------------------------------------------");
                sorted = _.sortBy(Array.from(c.stats.values()), function(word) { return -word.tfIdfSum;});

                sorted.forEach(function (word){
                      console.log(word.word + ";" + word.nbrDocs + ";" +
                                    numeral(word.tfAvg).format("0.00")  + ";" +
                                    numeral(word.tfMin).format("0.00")  + ";" +
                                    numeral(word.tfMax).format("0.00")  + ";" +
                                    numeral(word.idfAvg).format("0.00")   + ';' +
                                    numeral(word.tfIdfSum).format("0.00")  + ';' +
                                    numeral(word.tfIdfAvg).format("0.00"));
                });

            });

            /*
            var allWords = Array.from(corpus[0].stats.values()).concat(Array.from(corpus[1].stats.values()).concat(Array.from(corpus[2].stats.values())));
            sorted = _.sortBy(allWords, function(word) { return -word.tfIdfSum;});

            sorted.forEach(function (word){
                  console.log(word.word + ";" + word.nbrDocs + ";" +
                                numeral(word.tfAvg).format("0.00")  + ";" +
                                numeral(word.tfMin).format("0.00")  + ";" +
                                numeral(word.tfMax).format("0.00")  + ";" +
                                numeral(word.idfAvg).format("0.00")   + ';' +
                                numeral(word.tfIdfSum).format("0.00")  + ';' +
                                numeral(word.tfIdfAvg).format("0.00"));
            });
            */
        }
        else {

            sorted = _.sortBy(Array.from(corpus.stats.values()), function(word) { return -word.tfIdfSum;});

            sorted.forEach(function (word){
                  console.log(word.word + ";" + word.nbrDocs + ";" +
                                numeral(word.tfAvg).format("0.00")  + ";" +
                                numeral(word.tfMin).format("0.00")  + ";" +
                                numeral(word.tfMax).format("0.00")  + ";" +
                                numeral(word.idfAvg).format("0.00")   + ';' +
                                numeral(word.tfIdfSum).format("0.00")  + ';' +
                                numeral(word.tfIdfAvg).format("0.00"));
            });

        }



        done();

  });
});


});
