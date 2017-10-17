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
  it("test save a corpus of 10 documents from a Google SERP", function test() {
    this.timeout(1000000);
    corpus.saveCorpus(simpleSearch, outputDir)
      // .then(corpus => corpus.should.to.have.lengthOf(10))
      .catch(error => /* error.should.not.be.null */ console.log(error));
  });
});
