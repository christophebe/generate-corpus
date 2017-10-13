const serp = require("serp");
const extractor = require("unfluff");
const request = require("request-promise-native");
const natural = require("natural-content");
const deepcopy = require("deepcopy");

// const iconv = require("iconv-lite");
// const detectEncoding = require("detect-character-encoding");
// const js2xmlparser = require("js2xmlparser");
const log = require("crawler-ninja-logger").Logger;

const DEFAULT_TIME_OUT = 20000;
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1";


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
  // TODO : For a long list of urls, don't execute all loadContent in //
  const promises = infoUrls.map(infoUrl => loadContent(options, infoUrl.url));
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

  logInfo("get urls", options);
  if (options.url) {
    return options.url;
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
  }
  urls = await serp.search(o);

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
 * @param  {String} url description
 * @return {String} the main content
 */
async function loadContent(options, url) {
  logInfo(`loadContent : ${url}`, options);
  let proxy = null;
  if (options.proxyList) {
    proxy = options.proxyList.pick().getUrl();
  }

  const searchOptions = {
    uri: url,
    headers: { "User-Agent": DEFAULT_USER_AGENT },
    rejectUnauthorized: false,
    timeout: options.timeout ? options.timeout : DEFAULT_TIME_OUT,
    resolveWithFullResponse: true,
    proxy,
  };


  logInfo(`request : ${url}`, searchOptions);
  const response = await request(searchOptions);
  const content = extractor(removeHTMLTags(response.body), options.language);
  let text = content.text;


  if (options.removeSpecials) {
    text = natural.removeSpecials(text);
  }
  if (options.removeDiacritics) {
    text = natural.removeDiacritics(text);
  }

  return { title: content.title, text, url };
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
 * logInfo - description
 *
 * @param  {type} message description
 * @param  {type} options description
 * @return {type}         description
 */
function logInfo(message, options) {
  log.info({ module: "generate-corpus", message, options });
}


/**
 * logError - description
 *
 * @param  {type} message description
 * @param  {type} options description
 * @param  {type} error   description
 * @return {type}         description
 */
function logError(message, options, error) {
  log.error({ module: "generate-corpus", message, options, error });
}


/**
 * unique - Return unique url for an array matching to a Serp result
 *
 * @param  {type} serpUrls description
 * @return {type}       description
 */
function unique(serpUrls) {
  // console.log(serpUrls);
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
