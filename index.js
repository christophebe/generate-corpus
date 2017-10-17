const corpus = require("./lib/corpus.js");
const w2v = require("./lib/w2v.js");

module.exports.generateCorpus = corpus.generateCorpus;
module.exports.saveCorpus = corpus.saveCorpus;
module.exports.buildVectors = w2v.buildVectors;
module.exports.loadCorpusModel = w2v.loadCorpusModel;
