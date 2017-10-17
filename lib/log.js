const log = require("crawler-ninja-logger").Logger;

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


module.exports.logInfo = logInfo;
module.exports.logError = logError;
