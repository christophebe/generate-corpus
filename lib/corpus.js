const p = require('util');
const fs = require('fs');
const Parallel = require('async-parallel');
const { getUrls } = require('./serp.js');
const { retrieveContent } = require('./content.js');
const { getKeywords } = require('./semantic.js');

const writeFile = p.promisify(fs.writeFile);

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
 * @param {boolean} onlyText if true only save the different texts of the corpus otherwise save the entire corpus
 * @returns {Arrays} an array of documents (String)
 */
async function saveCorpus(options, outputDir, onlyText = false) {
  const corpus = await generateCorpus(options);
  const fileName = getFileName(options);
  const filePath = onlyText ? `${ outputDir }/${ fileName }.txt` : `${ outputDir }/${ fileName }.json`;

  const content = onlyText ? getAllTexts(corpus) : getJsonAsText(corpus);

  await writeFile(filePath, content);

  return corpus;
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
 * @param {number} nrbOfRequests The number of requests to execute in parrallel
 * @returns {json} a corspus object with the list of of documents & keywords
 */
async function generateCorpus(options, nrbOfRequests = NBR_OF_REQUESTS) {
  process.setMaxListeners(Infinity);
  const infoUrls = await getUrls(options);

  const documents = await Parallel.map(infoUrls, async (infoUrl) => await retrieveContent(options, infoUrl), nrbOfRequests);
  const keywords = getKeywords(documents.map((d) => d.content));
  const { images, links, headers, titles, descriptions, h1s } = aggregateData(documents);

  return { documents, keywords, images, links, headers, titles, descriptions, h1s };
}

function aggregateData(documents) {
  const images = [];
  const links = [];
  const headers = [];
  const titles = [];
  const descriptions = [];
  const h1s = [];

  documents.forEach((d) => {
    images.push(...d.images);
    links.push(...d.links);
    headers.push(...d.headers);
    titles.push(d.title);
    descriptions.push(d.description);
    h1s.push(d.h1);
  });

  return { images, links, headers, titles, descriptions, h1s };
}

function getAllTexts(corpus) {
  return corpus.documents.map((d) => d.content).join('\n');
}

function getJsonAsText(corpus) {
  return JSON.stringify(corpus);
}

function getFileName(options) {
  return options.qs.q.join('-');
}

module.exports.generateCorpus = generateCorpus;

module.exports.saveCorpus = saveCorpus;
