const { expect } = require('chai');
const proxyLoader = require('simple-proxies/lib/proxyfileloader');
const { generateCorpus } = require('../index.js');

const simpleSearch = {
  host: 'google.fr',
  num: 10,
  qs: {
    q: [ 'éduquer son chien ' ],
    pws: 0
  },
  language: 'fr',
  contentFormat: 'md'

};

describe.skip('Generate corpus via proxies', async () => {
  let proxyList = null;

  before(async () => {
    try {
      console.log('Loading proxies ...');
      const config = proxyLoader.config()
        .setProxyFile('./proxies.txt')
        .setCheckProxies(false)
        .setRemoveInvalidProxies(false);

      proxyList = await proxyLoader.loadProxyFile(config);
      console.log(`Proxies loaded : ${ proxyList.getNumberOfProxies() }`);
    } catch (e) {
      console.log(e);
    }
  });
  it('test building a corpus of 10 documents from a Google SERP', async () => {
    try {
      simpleSearch.proxyList = proxyList;
      const corpus = await generateCorpus(simpleSearch);

      console.log('corpus', corpus);
      expect(corpus.documents).to.have.lengthOf(10);
    } catch (e) {
      console.log(e);
      expect(e).be.null;
    }
  });
});
