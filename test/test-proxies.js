const should = require("chai").should();
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
  language: "fr",

};

describe.skip("Generate corpus with proxies", () => {
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


  it("test building a corpus from a Google SERP", function test() {
    this.timeout(1000000);
    options.proxyList = proxyList;
    search.generateCorpus(options)
      .then(corpus => corpus.should.to.have.lengthOf(10))
      .catch(error => error.should.not.be.null);
  });
});
