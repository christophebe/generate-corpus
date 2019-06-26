const request = require('request-promise-native');
const natural = require('natural-content');
const cheerio = require('cheerio');
const detectEncoding = require('detect-character-encoding');
const { findContent } = require('find-main-content');
const log = require('./log');

const DEFAULT_TIME_OUT = 20000;
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1';
const HTTP_200 = 200;

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

module.exports.retrieveContent = retrieveContent;
