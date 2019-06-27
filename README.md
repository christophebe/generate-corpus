This module can build a corpus based on a google search or from a set of URLs.
It also gives the possibility to make basic semantic analysis on the corpus.

**Please wait ... still in progress. Your are welcome to contribute or suggest new ideas !**

## Install

```javascript
npm install generate-corpus --save
```


## Build a corpus from a google search

```javascript
const corpus = require("generate-corpus");


const options = {
    host : "google.be",
    num : 100,
    qs: {
        q: "barbecue",
        pws : 0,
    }
};

try {
  const corpus = await corpus.generateCorpus(options);
  console.log(corpus); // Excellent data structure about the corpus !
} catch(error) {
  console.log(error);
}

```

## Build a corpus from a set of URLs

```javascript

const search = require("generate-corpus");

const options = {
    urls : ["http://www.site.com", "http://www.site2.com", ...]
};

try {
  const corpus = await corpus.generateCorpus(options);
  console.log(corpus); 
} catch(error) {
  console.log(error);
}

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


**Other options**
- proxy : the proxy url used to make the google search & retrieve page content : http://user:password@host:port.

Proxy parameter can be replaced by proxyList if you are using a list of proxies (see below).

## With proxies

**If you want to use only one proxy for all http requests :**
The options can contain the proxy url

```javascript

const options = {
    host : "google.fr",
    num : 15,
    qs: {
        q: "choisir son champagne",
        pws : 0
    },
    language : 'fr',
    proxy : "http://user:password@host:port"
};

```

**If you want to user severals proxies**
In this case, you can use the nodejs module ("simple proxies")[https://github.com/christophebe/simple-proxies]
This component load proxies from a text file or a DB.
