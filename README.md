What is a corpus, Dude ?! This is just a set of words related to another one (in this case).

This module can build a corpus based on a google search or from a set of URLs. The first solution can be used to analyzed the words used by your top competitors.

**Please wait ... still in progress. Your are welcome to contribute or suggest new ideas !**

# Install

```javascript
npm install generate-corpus --save
```


# Build a corpus from a google search

```javascript

var search = require("generate-corpus");

var options = {
    host : "google.fr",
    qs: {
        q: "courtier crédit", // Keyword
        num : 5 // Number of results in the SERP
    },
    nbrGrams : 1, // expression len (one or more words)
    withStopWords : false, // with or without stopwords
    language : 'fr'
    //,proxy - if need see the npm module simple-proxies
};

search.generateCorpus(options, function(error, corpus){

    if (error) {
      console.log(error);
    }

    console.log(corpus);

```

# Build a corpus from a set of URLs

```javascript

var options = {
    urls : ["http://www.site.com", "http://www.site2.com", ...],
    nbrGrams : 2, // expression len (one or more words)
    withStopWords : false, // with or without stopwords
    language : 'fr'
    //,proxy - if need see the npm module simple-proxies
};

search.generateCorpus(options, function(error, corpus){

    if (error) {
      console.log(error);
    }

    console.log(corpus);

```

# Data structure
 The generateCorpus function returns the following structure :

 ```javascript
 {
   numberOfDocs: 10, // number of analyzed documents
   stats: {
     // The number of documents for each word
     // The array index matches to the found expression
     nbrDocsByWords:[
       'prêt': 9,
        immobilier: 10,
        pensez: 2,
        cafpi: 4,
        'n°1': 2,
        courtiers: 6,
        'crédit': 9,
        presse: 1,
        international: 2,
        montant: 6,
        'mensualités': 3,
        ....
     ],
     // Stat for each expression found
     words: [
        { 'prêt': {   
          // tf : Term Frequency
          tfMin: 0.16666666666666666,
          tfMax: 1,
          tfAvg: 0.6470899470899472,

          // Inverse Document Frequency
          idfMax: 1.5108256237659907,
          idfAvg: 1.5108256237659907,

          // TF.IDF
          tfIdfMin: 0.2518042706276651,
          tfIdfMax: 1.5108256237659907,
          tfIdfAvg: 0.9776400729448712,
          tfIdfSum: 8.798760656503841,
        },
        immobilier: { ... },
        ...
      ]
   }


}
```
See the unit test to know to sort the word list.


# TODO
- Review the data structure in order to simplify output, order & filter.
- Support multiples languages for stopwords, .... We are supporting for the moment only french.
- Add cooccurrences for each terms.
- generate a corpus based on "lemmatisation"
- Server with API & multiples process
- optional code to store results in a DB
