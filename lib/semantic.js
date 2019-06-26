const { getTopKeywords } = require('natural-content');

const MAX_TOP_KEYWORDS = 15;

function getKeywords(texts) {
  return getTopKeywords(texts, MAX_TOP_KEYWORDS);
}

module.exports.getKeywords = getKeywords;
