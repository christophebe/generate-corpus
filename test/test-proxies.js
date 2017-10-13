const search = require("../index.js");
const numeral = require("numeraljs");
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
  num: 10,
  qs: {
    q: "développement du chien",
    pws: 0,
    // lr : "lang_fr" //,
    // cr : "BE"
  },
  nbrGrams: [1, 2, 3],
  withStopWords: false,
  language: "fr",
  removeSpecials: false,
  removeDiacritics: false,
  // ,proxy
};

describe("Generate corpus", () => {
  let proxyList = null;
  before(function before(done) {
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


  it.only("test building a corpus from a Google SERP", function test() {
    this.timeout(1000000);
    options.proxyList = proxyList;
    search.generateCorpus(options)
      .then(result => console.log("result", result.length))
      .catch(error => console.log(error));
  });
});
