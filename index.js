var serp           = require("serp");
var async          = require("async");
var cheerio        = require("cheerio");
var _              = require("underscore");
var extractor      = require("unfluff");
var request        = require("request");
var natural        = require("natural-content");
var iconv          = require("iconv-lite");
var detectEncoding = require('detect-character-encoding');
var log            = require("crawler-ninja-logger").Logger;

var DEFAULT_TIME_OUT = 20000;
var DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1';
/**
 *  Generate a corpus in function of a google SERP or a set of URLs
 *
 * @param options, a json structure with the following strucure :
 *
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
 *    language : 'en' // iso language code
 *  }
 *  @param gram size : 1 words, 2 words, ....
 *  @param with or without stop words
 *  @param iso language code
 *  @param callback(error, corpus) - See the unit test to get the corpus data structure
 */
module.exports.generateCorpus = function(options, callback) {

  async.waterfall([
        function(callback) {
            if (options.urls) {
              callback(null, options.urls);
            }
            else {
              // Make sure that the language is also set for the google search
              if (options.language) {
                options.qs.hl = options.language;
              }

              googleSearch(options, callback);
            }
        },
        function(urls, callback) {
            loadContents(urls, options.language, options.removeSpecials, options.removeDiacritics, options.timeout, callback);
        },
        function(contents, callback) {
            logInfo("Calculate the tf.idf ....", options);

            if ( _.isArray(options.nbrGrams)) {
              callback(null,
                _.map(options.nbrGrams, function(nbrGrams) { return natural.getTfIdfs(contents, nbrGrams, options.withStopWords, options.language);}));
            }
            else {
              callback(null, natural.getTfIdfs(contents, options.nbrGrams, options.withStopWords, options.language));
            }

        }
    ], function (error, corpus) {
        callback(error, corpus);
    });

};

/**
 * Search on Google for a specific keyword or a set of keywords
 *
 *
 * @param options : the usual option for the serp module : https://github.com/christophebe/serp
 * @param callback(error, urls) urls is an array of url matching to the keyword SERP
 */

function googleSearch(options, callback) {

    logInfo("Search on " + options.host + " for '" + options.qs.q + "' - nbr of results : " + options.num, options);

    // if the q parameter is an arrays of keywords
    // => execute a google search of all of them and group all url in one array
    if (_.isArray(options.qs.q)) {

        var tasks = _.map(options.qs.q, function(q) { return createTask(q, options);});

        async.parallel(tasks, function(error, results){
            callback(error, _.uniq(_.flatten(results)));
        });

    }
    // The q parameter is a simple keyword
    // => make just one search on google with this keyword
    else {
      serp.search(options, function(error, urls) {
              callback(error, urls);
        });
    }

}

function createTask(q, options) {
    var o = _.clone(options);
    o.qs.q = q;

    return async.apply(serp.search,o);
}

/**
 *  Load the content from the SERP urls
 *
 * @param an array of url matching to the result SERP pages
 * @param callback(error, contents) - an arrays of content (Strings)
 */
function loadContents(urls, language, removeSpecials, removeDiacritics, timeout, endCallback) {

    var tasks = _.map(urls, function(url){ return function(callback){ loadContent(url, language, removeSpecials, removeDiacritics, timeout, callback);}; });

    async.parallel(tasks, function(error, results){
        endCallback(error, results);
    });
}


/**
 *  Load the main content of an HTML page without Ads, sidebars, ...
 *
 * @param The url matching to the content
 * @param the target language
 * @param callback(error, content) - String, content converted in the correct encofing
 */
function loadContent (url, language, removeSpecials, removeDiacritics, timeout, endCallback) {
    logInfo("load content : " + url);
    async.waterfall([
          async.apply(httpRequest, url, timeout),
          function(htmlContent, callback) {
              var content = extractor(htmlContent, language).text;
              if (removeSpecials) {
                  content = natural.removeSpecials(content);
              }
              if (removeDiacritics) {
                content = natural.removeDiacritics(content);
              }

              callback(null, content);
          }
      ], function (error, cleanContent) {
          endCallback(error, cleanContent);
      });

}

function httpRequest(url, timeout, callback) {
    // encoding is null in order to get the response as buffer instead of String
    // By this way, we can detect the page encoding
    var options = {
        uri : url,
        encoding : null,
        headers : {"User-Agent" : DEFAULT_USER_AGENT},
        // For HTTPS requests
        // Some old servers do not support recent TSL version
        secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
        rejectUnauthorized : false,

        timeout : timeout ?  timeout : DEFAULT_TIME_OUT,
    };

    request(options ,function (error, response, body) {

          if (error) {
            logError("Impossible to load the content" , options, error);

            // Don't stop the process to load all contents
            return callback(null, "");
          }

          if (response.statusCode === 200) {
            var charsetMatch = detectEncoding(body);
            callback(null, iconv.decode(body, charsetMatch.encoding));
          }
          else {
            logError("Impossible to load the content for : " + url + " - Http status : " + response.statusCode, options);
            // Don't stop the process to load all contents
            callback(null, "");

          }
    }).setMaxListeners(0);
}


function logInfo(message, options) {
  log.info({module : "generate-corpus", message : message, options : options});
}

function logError(message, options, error) {
  log.error({module : "generate-corpus", message : message, options : options, error : error});
}
