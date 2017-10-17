const should = require("chai").should();
const corpus = require("../index.js");

const outputDir = "./test/test-save-corpus";

describe("Extract data from a corpus", () => {
  it("test", function test() {
    this.timeout(1000000);
    corpus.buildVectors(outputDir)
      // .then(corpus => corpus.should.to.have.lengthOf(10))
      .catch(error => /* error.should.not.be.null */ console.log(error));
  });
});
