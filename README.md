What is a corpus, Dude ?! This is just a set of words related to another one (in this case a keyword).

This module can build a corpus based on a google search or from a set of URLs. The first solution can be used to analyzed the words used by your top competitors.

**Please wait ... still in progress. Your are welcome to contribute or suggest new ideas !**

## Install

```javascript
npm install generate-corpus --save
```


## Build a corpus from a google search

```javascript
var corpus = require("generate-corpus");
var _      = require("underscore");

var options = {
    host : "google.be",
    num : 15,
    qs: {
        q: "rachat+crédit",
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

## Build a corpus from a set of URLs

```javascript

var search      = require("generate-corpus");

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

## Understanding the options

In both previous examples, the option json structure can contain the following parameters :

**For the google search**
- host : the google domain (google.com, google.fr, ... ). Default value : google.com.
- num : the size of the SERP (number of pages to search).
- qs : it used to customize the search on google :
   q   : it the search keyword (replace spaces by +). It can be also an array of keywords.
   qs can also contains other Google search params, see this document : https://moz.com/ugc/the-ultimate-guide-to-the-google-search-parameters.

- User-Agent : not mandatory. Default value is : 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1'


**For generating the list of words/expressions**    
- nbrGrams : the ngram compositions (could be a simple value of an array of ngrams, eg. : [1,2,3]).
- withStopWords : if true, the lexical field will be made with the stop words.
- language : the language iso code used to generate the corpus.
- removeSpecials : remove numbers & special caracters before building the corpus.
- removeDiacritics : remove diacritics before building the corpus.


**Other options**
- proxy : the proxy url used to make the google search & retrieve page content : http://user:password@host:port.

Proxy parameter can be replaced by proxyList if you are using a list of proxies (see below).

## With proxies

**If you want to use only one proxy for all http requests :**
The options can contain the proxy url

```javascript


var options = {
    host : "google.fr",
    num : 15,
    qs: {
        q: "choisir son champagne",
        pws : 0,
        //lr : "lang_fr",
        //cr : "BE"
    },
    nbrGrams : 3,
    withStopWords : false,
    language : 'fr',
    proxy : "http://user:password@host:port"
};

```

**If you want to user severals proxies**
In this case, you can use the nodejs module ("simple proxies")[https://github.com/christophebe/simple-proxies]
This component load proxies from a text file or a DB.


```javascript
var proxyLoader = require("simple-proxies/lib/proxyfileloader");
var search      = require("generate-corpus");

var config = proxyLoader.config().setProxyFile("./proxies.txt")
                                 .setCheckProxies(true)
                                 .setRemoveInvalidProxies(true);

proxyLoader.loadProxyFile(config,function(error, proxyList){
    if (error) {
      // Manage error here
    }
    generateCorpus(proxyList)
});

function generateCorpus(proxyList) {

  var options = {
        host : "google.fr",
        num : 15,
        qs: {
            q: "choisir son champagne",
            pws : 0,
            //lr : "lang_fr",
            //cr : "BE"
        },
        nbrGrams : 3,
        withStopWords : false,
        language : 'fr',
        proxyList : proxyList
  }

  search.generateCorpus(options, function(error, corpus){

      if (error) {
        console.log(error);
      }

      console.log(corpus);
  });


}

```

## Data structure

*If the options.nbrGrams is a simple value* , the generateCorpus function returns a map with a key matching to the word (or the ngram expression) and with a value based on the following structure :

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

*If the options.nbrGrams is an array of ngrams*, the generateCorpus return an arrays of map matching to the previous structure.
See the unit test for a complete example.

# TODO
- Support multiples languages for stopwords, .... We are supporting for the moment only french.
- Add cooccurrences for each terms.
- Extract Named Entity.
- generate a corpus based on "lemmatisation".
- Server with API & multiples process.
