const { expect } = require('chai');
const { saveCorpus, generateCorpus } = require('../index.js');

const DOCS_10 = 10;
const DOCS_100 = 100;

const simpleSearch = {
  host: 'google.fr',
  num: DOCS_10,
  qs: {
    q: [ 'éduquer son chien ' ],
    pws: 0
  },
  language: 'fr',
  contentFormat: 'md'

};

const search100 = {
  host: 'google.fr',
  num: DOCS_100,
  qs: {
    q: [ 'comment éduquer son chien' ],
    pws: 0,
    num: DOCS_100
  },
  language: 'fr'

};

const doubleSearch = {
  host: 'google.fr',
  num: 10,
  qs: {
    q: [ 'développement du chien', 'développement du chien' ],
    pws: 0
  },
  language: 'fr'
};

describe('Generate corpus', async () => {
  it.skip('test saving a corpus of 10 documents from a Google SERP', async () => {
    try {
      await saveCorpus(simpleSearch, './test', false);

      // console.log('corpus', corpus);
      // expect(corpus.documents).to.have.lengthOf(DOCS_10);
    } catch (e) {
      console.log(e);
      expect(e).be.null;
    }
  });

  it('test building a corpus of 10 documents from a Google SERP', async () => {
    try {
      const corpus = await generateCorpus(simpleSearch);

      console.log('corpus', corpus);
      expect(corpus.documents).to.have.lengthOf(DOCS_10);
    } catch (e) {
      console.log(e);
      expect(e).be.null;
    }
  });

  it.skip('test building a corpus of 20 documents with duplicate docs from a Google SERP', async () => {
    try {
      const corpus = await generateCorpus(doubleSearch);

      // console.log('corpus', corpus);
      expect(corpus.documents).to.have.lengthOf(DOCS_10);
    } catch (e) {
      console.log(e);
      expect(e).be.null;
    }
  });

  it.skip('test building a corpus of 100 documents', async () => {
    try {
      const corpus = await generateCorpus(search100);

      console.log('corpus', corpus);
      expect(corpus.documents).to.have.lengthOf(DOCS_100);
    } catch (e) {
      console.log(e);
      expect(e).be.null;
    }
  });
});
