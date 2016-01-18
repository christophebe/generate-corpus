var serp           = require("serp");
var async          = require("async");
var cheerio        = require("cheerio");
var _              = require("underscore");
var extractor      = require("unfluff");
var request        = require("request");
var natural        = require("natural-content");
var iconv          = require("iconv-lite");
var detectEncoding = require('detect-character-encoding');


/**
 *  Load the main content of an HTML page without Ads, sidebars, ...
 *
 * @param The url matching to the content
 * @param the target language
 * @param callback(error, content) - String, content converted in the correct encofing
 */
function loadContent (url, language, endCallback) {
    console.log("Read content : " + url);
    async.waterfall([
          function(callback) {
            // encoding is null in order to get the response as buffer instead of String
            request({uri: url, encoding: null} ,function (error, response, body) {

                  if (error) {
                    console.log("Impossible to load the content for : " + url + " - error : " + error);

                    // Don't stop the process to load all contents
                    return callback(null, "");
                  }

                  if (response.statusCode === 200) {
                    var charsetMatch = detectEncoding(body);
                    callback(null, iconv.decode(body, charsetMatch.encoding));
                  }
                  else {
                    console.log("Impossible to load the content for : " + url + " - Http status : " + response.statusCode);
                    // Don't stop the process to load all contents
                    return callback(null, "");

                  }
            });
          },
          function(htmlContent, callback) {
              var data = extractor(htmlContent, language);
              callback(null, data.text);
          }
      ], function (error, cleanContent) {
          endCallback(error, cleanContent);
      });

}

/**
 *  Load the content from the SERP urls
 *
 * @param an array of url matching to the result SERP pages
 * @param callback(error, contents) - an arrays of content (Strings)
 */
function loadContents(urls, language, endCallback) {

    var tasks = _.map(urls, function(url){ return function(callback){ loadContent(url, language, callback);}; });

    async.parallel(tasks, function(error, results){
        endCallback(error, results);
    });
}

/**
 * Search on Google for a specific keyword
 *
 *
 * @param options : the usual option for the serp module : https://github.com/christophebe/serp
 * @param callback(error, urls) urls is an array of url matching to the keyword SERP
 */

function googleSearch(options, callback) {
    console.log("Search on " + options.host + " for '" + options.qs.q + "' - nbr of results : " + options.qs.num);

    serp.search(options, function(error, urls) {
          //console.log("find urls : ", urls);
          callback(error, urls);
    });

}

/**
 *  Generate a corpus in fonction of a google SERP or a set of URLs
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
              googleSearch(options, callback);
            }
        },
        function(urls, callback) {
            loadContents(urls, options.language, callback);
        },
        function(contents, callback) {
            console.log("Compute TF.IDF");
            callback(null, natural.getTfIdfs(contents, options.nrbGrams, options.withStopWords));
        }
    ], function (error, corpus) {
        callback(error, corpus);
    });

};
