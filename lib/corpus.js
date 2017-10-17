const p = require("util");
const appendFile = p.promisify(require("fs").appendFile);
const serp = require("serp");
const extractor = require("unfluff");
const request = require("request-promise-native");
const natural = require("natural-content");
const deepcopy = require("deepcopy");
const log = require("./log");

// const iconv = require("iconv-lite");
// const detectEncoding = require("detect-character-encoding");
// const js2xmlparser = require("js2xmlparser");


const DEFAULT_TIME_OUT = 20000;
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1";

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
 * @param {String} outputDir the path of the folder
 * @return {Arrays} an array of documents (String)
 */
async function saveCorpus(options, outputDir) {
  const corpus = await generateCorpus(options);
  const docFile = `${outputDir}/corpus.txt`;
  // const titleFile = outputDir + "titles.txt";
  const promises = corpus.map(doc => appendFile(docFile, doc.text));
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
 * @return {Arrays} an array of documents (String)
 */
async function generateCorpus(options) {
  const infoUrls = await getUrls(options);
  log.logInfo(`Found ${infoUrls.length} urls`, options);
  // TODO : For a long list of urls, don't execute all loadContent in //
  const promises = infoUrls.map(infoUrl => retrieveContent(options, infoUrl));
  return Promise.all(promises);
}


/**
 * getUrls - Get the url documents
 *
 * @param  {json} options The options used to generate the corpus
 * @return {Arrays} The list of document URL
 */
async function getUrls(options) {
  let urls = null;

  log.logInfo("get urls", options);
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
    const promises = o.qs.q.map(kw => searchPromise(o, kw));
    const results = await Promise.all(promises);
    // Flatten the result array
    urls = [].concat(...results);
  } else {
    urls = await serp.search(o);
  }

  return unique(urls);
}


/**
 * searchPromise - return a promise for make a google search
 *
 * @param  {type} options the options used to generate the corpus
 * @param  {type} kw      the keyword used to search on google
 * @return {Promise}      a promise to make the search
 */
async function searchPromise(options, kw) {
  const o = deepcopy(options);
  o.qs.q = kw;
  return serp.search(o);
}
/**
 * loadContent - Load the main content from a url
 * @param  {json} options the options used to generate the corpus
 * @param  {String} urlInfo description
 * @return {String} the main content
 */
async function retrieveContent(options, urlInfo) {
  log.logInfo(`try to retrieve Content : ${urlInfo.url}`, options);
  let proxy = null;
  if (options.proxyList) {
    proxy = options.proxyList.pick().getUrl();
  }

  const searchOptions = {
    uri: urlInfo.url,
    headers: { "User-Agent": DEFAULT_USER_AGENT },
    rejectUnauthorized: false,
    timeout: options.timeout ? options.timeout : DEFAULT_TIME_OUT,
    resolveWithFullResponse: true,
    proxy,
  };

  try {
    log.logInfo(`request : ${urlInfo.url}`, searchOptions);
    const response = await request(searchOptions);
    const content = extractor(removeHTMLTags(response.body), options.language);
    let text = content.text;

    if (options.removeSpecials) {
      text = natural.removeSpecials(text);
    }
    if (options.removeDiacritics) {
      text = natural.removeDiacritics(text);
    }
    return { title: urlInfo.title, text, url: urlInfo.url };
  } catch (error) {
    log.logError(`Error during the http request for ${urlInfo.url}`, options, error);
    return { title: urlInfo.title, text: "", url: urlInfo.url };
  }
}


/**
 * removeHTMLTags - Remove tags that are not well managed by unfluff
 *
 * @param  {String} htmlContent the original HTML code
 * @return {String} the cleaned HTML code
 */
function removeHTMLTags(htmlContent) {
  // Some HTML code can contain some tags that are not managed by unfluff
  // Big workaround/hack until we find a better solution
  // => replace thoses tags by a space
  const content = htmlContent.replace(/(<b([^>]+)>)/ig, " ")
    .replace(/(<option([^>]+)>)/ig, " ");

  return content;
}


/**
 * unique - Return unique url for an array matching to a Serp result
 *
 * @param  {type} serpUrls description
 * @return {type}       description
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


module.exports.generateCorpus = generateCorpus;
module.exports.saveCorpus = saveCorpus;
