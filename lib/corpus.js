const p = require('util');
const fs = require('fs');
const Parallel = require('async-parallel');
const log = require('./log');
const { getUrls } = require('./serp.js');
const { retrieveContent } = require('./content.js');
const { getKeywords } = require('./semantic.js');

// const iconv = require("iconv-lite");
// const detectEncoding = require("detect-character-encoding");
// const js2xmlparser = require("js2xmlparser");
const appendFile = p.promisify(fs.appendFile);

require('events').EventEmitter.defaultMaxListeners = Infinity;

const NBR_OF_REQUESTS = 50;

/**
 * saveCorpus - Save a corpus in a specific folder
 *
 * @param  {json} options The options used to generate the corpus :
 *   - In function of a Google SERP :
 *   {
 *     host : googleDomain,
 *     qs : {
 *       q   : keyword,
 *       num : nbrOfResults
 *     },
 *     proxy : proxy, // optional,
 *     nbrGrams : 1, // gram size : 1 words, 2 words, ....
 *     withStopWords : True|False,  // with or without stop words
 *     language : 'en' // iso language code
 *   }
 *
 *  - In function of a set of URLS :
 *  {
 *    urls : ["http://...", "http://..."]
 *    nbrGrams : 1, // gram size : 1 words, 2 words, ....
 *    withStopWords : True|False,  // with or without stop words
 *    language : 'en
 *
 * @param {string} outputDir the path of the folder
 * @returns {Arrays} an array of documents (String)
 */
async function saveCorpus(options, outputDir) {
  const corpus = await generateCorpus(options);
  const docFile = `${ outputDir }/corpus.txt`;

  // const titleFile = outputDir + "titles.txt";
  const promises = corpus.map((doc) => appendFile(docFile, doc.text));

  await Promise.all(promises);
}

/**
 * generateCorpus - Generate a corpus based on a Google SERP of a set of URLS
 *
 * @param  {json} options The options used to generate the corpus :
 *   - In function of a Google SERP :
 *   {
 *     host : googleDomain,
 *     qs : {
 *       q   : keyword,
 *       num : nbrOfResults
 *     },
 *     proxy : proxy, // optional,
 *     nbrGrams : 1, // gram size : 1 words, 2 words, ....
 *     withStopWords : True|False,  // with or without stop words
 *     language : 'en' // iso language code
 *   }
 *
 *  - In function of a set of URLS :
 *  {
 *    urls : ["http://...", "http://..."]
 *    nbrGrams : 1, // gram size : 1 words, 2 words, ....
 *    withStopWords : True|False,  // with or without stop words
 *    language : 'en
 *
 * @returns {json} a corspus object with the list of of documents & keywords
 */
async function generateCorpus(options) {
  process.setMaxListeners(Infinity);
  const infoUrls = await getUrls(options);

  log.logInfo(`Found ${ infoUrls.length } urls`, options);

  const documents = await Parallel.map(infoUrls, async (infoUrl) => await retrieveContent(options, infoUrl), NBR_OF_REQUESTS);
  const keywords = getKeywords(documents.map((c) => c.content));

  return { documents, keywords };
}

module.exports.generateCorpus = generateCorpus;

module.exports.saveCorpus = saveCorpus;
