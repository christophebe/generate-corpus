const p = require("util");
const word2phrase = p.promisify(require("word2vec").word2phrase);
const word2vec = p.promisify(require("word2vec").word2vec);
const loadWordModel = p.promisify(require("word2vec").loadModel);


const corpus = "docs.txt";
const phrases = "phrases.txt";
const vectors = "vectors.txt";

const phraseParam = {
  threshold: 5,
  debug: 2,
  minCount: 2,
};

const vectorParam = {
  cbow: 1,
  size: 200,
  window: 8,
  negative: 25,
  hs: 0,
  sample: 1e-4,
  threads: 20,
  iter: 15,
  minCount: 2,
};


/**
 * buildVectors - Build word vectors from a corpus
 *
 * @param {String} corpusFolder the path of the folder that contains the corpus
 * @return {type}  description
 */
async function buildVectors(corpusFolder) {
  console.log("Building Phrases ...");
  await word2phrase(`${corpusFolder}/${corpus}`, `${corpusFolder}/${phrases}`);
  console.log("Building vectors ...");
  await word2vec(`${corpusFolder}/${phrases}`, `${corpusFolder}/${vectors}`, vectorParam);
}


/**
 * async loadModel - description
 *
 * @param  {type} corpusFolder description
 * @return {type}              description
 */
async function loadCorpusModel(corpusFolder) {
  console.log("Load model ...");
  const model = await loadWordModel(`${corpusFolder}/${vectors}`);
  return model;
  // const wordVecs = model.getVectors(["prêt", "personnel"]);
  // console.log(wordVecs);
}

module.exports.buildVectors = buildVectors;
module.exports.loadCorpusModel = loadCorpusModel;
