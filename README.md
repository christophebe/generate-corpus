What is a corpus, Dude ?! This is just a set of words related to another one (in this case).

This module can build a corpus based on a google search or from a set of URLs. The first solution can be used to analyzed the words used by your top competitors.

**Please wait ... still in progress. Your are welcome to contribute or suggest new ideas !**

# Install

```javascript
npm install generate-corpus --save
```


# Build a corpus from a google search

```javascript
var corpus = require("generate-corpus");
var _      = require("underscore");

var options = {
    host : "google.be",
    qs: {
        q: "rachat+crédit",
        num : 15,
        pws : 0,
        //lr : "lang_fr",
        //cr : "BE"
    },
    nbrGrams : 2,
    withStopWords : false,
    language : 'fr'
    //,proxy
};

corpus.generateCorpus(options, function(error, corpus){

    if (error) {
      return console.log(error);
    }

    // Sort the list of words
    var sorted = _.sortBy(Array.from(corpus.stats.values()), function(word) { return -word.tfIdfSum;});

    console.log("Word;Nbr Docs;TF Avg;TF Min;TF Max;IDF Avg;TF.IDF Sum;TF.IDF Avg");
    sorted.forEach(function (word){
        console.log(word.word + ";" + word.nbrDocs + ";" +
                    word.tfAvg + ";" + word.tfMin + ";" +
                    word.tfMax + ";" + word.idfAvg + ';' +
                    word.tfIdfSum + ';' + word.tfIdfAvg);
    });


});
```

# Build a corpus from a set of URLs

```javascript

var options = {
    urls : ["http://www.site.com", "http://www.site2.com", ...],
    nbrGrams : 2, // expression len (one or more words)
    withStopWords : false, // with or without stopwords
    language : 'fr'

};

search.generateCorpus(options, function(error, corpus){

    if (error) {
      console.log(error);
    }

    console.log(corpus);
});
```

# Data structure

The generateCorpus function returns a map with a key matching to the word (or the ngram expression) and with a value based on the following structure :

 ```javascript
  {  
    // the word
    word : "..."

    // Number of docs containing the word
    nbrDocs : 5,

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

}
```
See the unit test for a complete example.

# TODO
- Support multiples languages for stopwords, .... We are supporting for the moment only french.
- Add cooccurrences for each terms.
- generate a corpus based on "lemmatisation"
- Server with API & multiples process
