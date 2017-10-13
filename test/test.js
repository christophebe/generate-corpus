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
  it("test unfluff with bad HTML code", () => {
    let content = "<html><body><p>Conditions d'utilisation<b class='hideforacc'>du Service de livraison internationale - la page s'ouvre dans une nouvelle fenêtre ou un nouvel onglet</b></p></body></html>";
    content = content.replace(/(<b([^>]+)>)/ig, " ");
    content = extractor(content, "fr").text;
    console.log(">>", content);
  });

  it("test building a corpus from a Google SERP", function test() {
    this.timeout(1000000);
    search.generateCorpus(options)
      .then(result => console.log("result", result))
      .catch(error => console.log(error));
  });
});
