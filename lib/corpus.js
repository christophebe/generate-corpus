const p = require('util');
const fs = require('fs');
const serp = require('serp');
const request = require('request-promise-native');
const natural = require('natural-content');
const deepcopy = require('deepcopy');
const cheerio = require('cheerio');
const Parallel = require('async-parallel');
const detectEncoding = require('detect-character-encoding');
const { findContent } = require('find-main-content');
const log = require('./log');

// const iconv = require("iconv-lite");
// const detectEncoding = require("detect-character-encoding");
// const js2xmlparser = require("js2xmlparser");
const appendFile = p.promisify(fs.appendFile);

require('events').EventEmitter.defaultMaxListeners = Infinity;

const DEFAULT_TIME_OUT = 20000;
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1';
const NBR_OF_REQUESTS = 30;
const HTTP_200 = 200;

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
 * @returns {Arrays} an array of documents (String)
 */
async function generateCorpus(options) {
  process.setMaxListeners(Infinity);
  const infoUrls = await getUrls(options);

  log.logInfo(`Found ${ infoUrls.length } urls`, options);

  return await Parallel.map(infoUrls, async (infoUrl) => await retrieveContent(options, infoUrl), NBR_OF_REQUESTS);
}

/**
 * getUrls - Get the url documents
 *
 * @param  {json} options The options used to generate the corpus
 * @returns {Arrays} The list of document URL
 */
async function getUrls(options) {
  let urls = null;

  log.logInfo('get urls', options);

  if (options.urls) {
    return options.urls;
  }

  const o = deepcopy(options);

  if (o.language) {
    o.qs.hl = options.language;
  }

  // if the q parameter is an arrays of keywords
  // => execute a google search of all of them and group all url in one array
  if (Array.isArray(o.qs.q)) {
    const promises = o.qs.q.map((kw) => searchForKw(o, kw));
    const results = await Promise.all(promises);

    // Flatten the result array
    urls = [].concat(...results);
  } else {
    urls = await serp.search(o);
  }

  // Return a unique set of URLS
  return unique(urls);
}

/**
 * searchForKw - Execute a search on google for a specific kw
 *
 * @param  {type} options the options used to generate the corpus
 * @param  {type} kw      the keyword used to search on google
 * @returns {Promise}      a promise to make the search
 */
async function searchForKw(options, kw) {
  const o = deepcopy(options);

  o.qs.q = kw;

  return await serp.search(o);
}

/**
 * loadContent - Load the main content from a url
 * @param  {json} options the options used to generate the corpus
 * @param  {string} urlInfo description
 * @returns {string} the main content
 */
async function retrieveContent(options, urlInfo) {
  log.logInfo(`try to retrieve Content : ${ urlInfo.url }`, options);

  try {
    const requestOptions = buildRequest(options, urlInfo.url);

    log.logInfo(`request : ${ urlInfo.url }`, requestOptions);
    const response = await request(requestOptions);

    if (response.statusCode !== HTTP_200) {
      return { title: '', description: '', content: '', url: urlInfo.url, googleTitle: urlInfo.title, error: `Invalide status code : ${ response.statusCode }` };
    }

    const contentType = response.caseless.get('Content-Type');

    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return { title: '', description: '', content: '', headers: [], url: urlInfo.url, googleTitle: urlInfo.title, error: `Invalid Content Type : ${ contentType }` };
    }

    const result = getContent(response.body, options);

    return { title: result.title, description: result.description, content: result.content, headers: result.headers, url: urlInfo.url, googleTitle: urlInfo.title };
  } catch (error) {
    log.logError(`Error during the http request for ${ urlInfo.url }`, options, error);

    return { title: '', description: '', content: '', headers: [], url: urlInfo.url, googleTitle: urlInfo.title, error: error.message };
  }
}

function getContent(htmlBody, options) {
  const { encoding } = detectEncoding(htmlBody);
  const $ = cheerio.load(htmlBody.toString(encoding));

  const result = findContent($, 'txt');

  // let text = result.content;

  if (options.removeSpecials) {
    result.content = natural.removeSpecials(result.content);
  }
  if (options.removeDiacritics) {
    result.content = natural.removeDiacritics(result.content);
  }

  return result;
}

/**
 * unique - Return unique url for an array matching to a Serp result
 *
 * @param  {type} serpUrls description
 * @returns {type}       description
 */
function unique(serpUrls) {
  const urls = [];

  return serpUrls.reduce((uniqueArray, urlInfo) => {
    if (urls.indexOf(urlInfo.url) === -1) {
      urls.push(urlInfo.url);
      uniqueArray.push(urlInfo);
    }

    return uniqueArray;
  }, []);
}

function buildRequest(options, url) {
  let proxy = null;

  if (options.proxyList) {
    proxy = options.proxyList.pick().getUrl();
  }

  const requestOptions = {
    uri: url,
    headers: { 'User-Agent': DEFAULT_USER_AGENT },
    rejectUnauthorized: false,
    followAllRedirects: true,
    timeout: options.timeout ? options.timeout : DEFAULT_TIME_OUT,

    // we need to detect the encoding
    encoding: null,
    resolveWithFullResponse: true,
    proxy

  };

  return requestOptions;
}

module.exports.generateCorpus = generateCorpus;

module.exports.saveCorpus = saveCorpus;
