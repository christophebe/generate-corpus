const deepcopy = require('deepcopy');
const serp = require('serp');

/**
 * getUrls - Get the url documents
 *
 * @param  {json} options The options used to generate the corpus
 * @returns {Arrays} The list of document URL
 */
async function getUrls(options) {
  let urls = null;

  if (options.urls) {
    return options.urls;
  }

  const o = cloneOption(options);

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
  const o = cloneOption(options);

  o.qs.q = kw;

  return await serp.search(o);
}

/**
 * unique - Return unique urls from Serp result
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

function cloneOption(option) {
  const o = deepcopy(option);

  o.proxyList = option.proxyList;

  return o;
}

module.exports.getUrls = getUrls;
