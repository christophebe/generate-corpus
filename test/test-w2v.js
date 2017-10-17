const util = require("util");
const mkdir = util.promisify(require("fs").mkdir);
const should = require("chai").should();
const corpus = require("../index.js");


const simpleSearch = {
  host: "google.be",
  num: 20,
  qs: {
    q: ["prêt personnel"],
    pws: 0,

  },
  language: "fr",

};

const outputDir = "./test/test-save-corpus";

describe("Save a genetated corpus", () => {
  before((done) => {
    mkdir(outputDir)
      .catch(error => console.log("ignore"));

    done();
  });

  it.only("test save a corpus of 10 documents from a Google SERP & generate vectors", function test() {
    this.timeout(1000000);

    /*
    corpus.saveCorpus(simpleSearch, outputDir)
      .then(() => corpus.buildVectors(outputDir))
      .then(() => corpus.loadCorpusModel(outputDir))
      .catch(error => error.should.has.to.be.null);
    */

    corpus.loadCorpusModel(outputDir)
      .then((model) => {
        const wordVecs = model.mostSimilar("prêt personnel");
        console.log(wordVecs);
        model.getNearestWords(model.getVector("prêt"), 10);
        console.log(wordVecs);
      })
      .catch(error => console.log(error));
  });
});
