const should = require("chai").should();
const search = require("../index.js");
const numeral = require("numeraljs");
const extractor = require("unfluff");

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


const simpleSearch = {
  host: "google.fr",
  num: 10,
  qs: {
    q: ["développement du chien"],
    pws: 0,
    // lr : "lang_fr" //,
    // cr : "BE"
  },
  language: "fr",

};

const doubleSearch = {
  host: "google.fr",
  num: 10,
  qs: {
    q: ["développement du chien", "développement du chien"],
    pws: 0,
    // lr : "lang_fr" //,
    // cr : "BE"
  },
  language: "fr",
};

const fullOptions = {
  host: "google.fr",
  num: 10,
  qs: {
    q: ["développement du chien"],
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
  it("test unfluff with bad HTML code", () => {
    let content = "<html><body><p>Conditions d'utilisation<b class='hideforacc'>du Service de livraison internationale - la page s'ouvre dans une nouvelle fenêtre ou un nouvel onglet</b></p></body></html>";
    content = content.replace(/(<b([^>]+)>)/ig, " ");
    content = extractor(content, "fr").text;
    console.log(">>", content);
  });

  it("test building a corpus of 10 documents from a Google SERP", function test() {
    this.timeout(1000000);
    search.generateCorpus(simpleSearch)
      .then(corpus => corpus.should.to.have.lengthOf(10))
      .catch(error => error.should.not.be.null);
  });

  it("test building a corpus of 20 documents with duplicate docs from a Google SERP", function test() {
    this.timeout(1000000);
    search.generateCorpus(doubleSearch)
      .then(corpus => corpus.should.to.have.lengthOf(10))
      .catch(error => error.should.not.be.null);
  });
});
