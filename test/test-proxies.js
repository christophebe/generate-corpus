const search = require("../index.js");
const _ = require("underscore");
const numeral = require("numeraljs");
const extractor = require("unfluff");
const proxyLoader = require("simple-proxies/lib/proxyfileloader");

numeral.language("fr", {
  delimiters: {
    thousands: " ",
    decimal: ",",
  },
  abbreviations: {
    thousand: "k",
    million: "m",
    billion: "b",
    trillion: "t",
  },
  ordinal(number) {
    return number === 1 ? "er" : "ème";
  },
  currency: {
    symbol: "€",
  },
});

numeral.language("fr");


const options = {
  host: "google.fr",
  num: 100,
  qs: {
    q: "simulateur credit",
    pws: 0,
    // lr : "lang_fr" //,
    // cr : "BE"
  },
  nbrGrams: [1, 2, 3, 4],
  withStopWords: true,
  language: "fr",
  removeSpecials: true,
  removeDiacritics: true,
  // ,proxy
};


describe("Generate corpus", () => {
  let proxyList = null;

  before(function (done) {
    this.timeout(100000);

    const config = proxyLoader.config().setProxyFile("./proxies.txt")
      .setCheckProxies(true)
      .setRemoveInvalidProxies(false);

    proxyLoader.loadProxyFile(config, (error, pl) => {
      if (error) {
        done(error);
      }
      proxyList = pl;
      console.log("proxies loaded");
      done();
    });
  });


  it("Generate Corpus", function (done) {
    this.timeout(1000000);
    options.proxyList = proxyList;
    search.generateCorpus(options, (error, corpus) => {
      if (error) {
        console.log(error);
        done();
      }
      console.log(corpus);
      /*
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
        */


      done();
    });
  });
});
