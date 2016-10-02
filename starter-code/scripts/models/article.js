// DONE: Wrap the entire contents of this file in an IIFE.
// Pass in to the IIFE a module, upon which objects can be attached for later access.
(function(module) {

  function Article (opts) {
    for (key in opts) {
      this[key] = opts[key];
    }
  }

  Article.prototype.toHtml = function(scriptTemplateId) {
    var template = Handlebars.compile($(scriptTemplateId).text());
    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
    this.body = marked(this.body);
    return template(this);
  };

  Article.loadAll = function(inputData) {
  /* NOTE: the original forEach code should be refactored
     using `.map()` -  since what we are trying to accomplish is the
     transformation of one collection into another. */
    Article.allArticles = inputData.sort(function(a,b) {
      return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
    }).map(function(ele) {
      return new Article(ele);
    });
  };

  /* NOTE: Refactoring the Article.fetchAll method, it now accepts a parameter
    that will execute once the loading of articles is done. We do this because
    we might want to call other view functions, and not just renderIndexPage();
    Now instead of calling articleView.renderIndexPage(), we can call
    whatever we pass in! */
  Article.fetchAll = function(next) {
    if (localStorage.hackerIpsum) {
      $.ajax({
        type: 'HEAD',
        url: '/data/hackerIpsum.json',
        success: function(data, message, xhr) {
          var eTag = xhr.getResponseHeader('eTag');
          if (!localStorage.eTag || eTag !== localStorage.eTag) {
            // DONE: pass 'next' into Article.getAll();
            Article.getAll(next);
          } else {
            Article.loadAll(JSON.parse(localStorage.hackerIpsum));
            // DONE: invoke next
            next();
          }
        }
      });
    } else {
    // DONE: pass 'next' into getAll();
      Article.getAll(next);
    }
  };

  Article.getAll = function(next) {
    $.getJSON('/data/hackerIpsum.json', function(responseData, message, xhr) {
      localStorage.eTag = xhr.getResponseHeader('eTag');
      Article.loadAll(responseData);
      localStorage.hackerIpsum = JSON.stringify(responseData);
      // DONE: invoke next!
      next();
    });
  };

  /* DONE: Chain together a `map` and a `reduce` call to get a rough count of
    all words in all articles. */
  Article.numWordsAll = function() {
    return Article.allArticles.map(function(article) {
    //DONE: Grab the word count from each article body.
      return article.body.split(' ').length;
    })
  // DONE: complete this reduce to get a grand total word count
  .reduce(function(total, number) {
    return total + number;
  });
  };

  /* DONE: Chain together a `map` and a `reduce` call to
          produce an array of *unique* author names. */
  Article.allAuthors = function() {
  //return       DONE: map our collection
    return Article.allArticles.map(function(article) {
      return article.author;
    })
    //return    DONE: return just the author names
    .reduce(function(authorNames, authorName) {
      if (authorNames.includes(authorName)===false) {
        authorNames.push(authorName);
      }
      return authorNames;
    }, []);
  /* DONE: For our `reduce` that we'll chain here -- since we are trying to
      return an array, we'll need to specify an accumulator type...
      What data type should this accumulator be and where is it placed? */
  };

  Article.numWordsByAuthor = function() {
  /* DONE: Transform each author element into an object with 2 properties:
      One for the author's name, and one for the total number of words across
      the matching articles written by the specified author. */
    return Article.allAuthors().map(function(articleAuthor) {
      return {
        name: articleAuthor,
        numWords: Article.allArticles.filter(function(article) {
          return article.author === articleAuthor;
        })
        .map(function(authorsArticle) {
          return authorsArticle.body.split(' ').length;
        })
        .reduce(function(totalWordCount, articleWordCounts) {
          return totalWordCount + articleWordCounts;
        })
      // name:
      // numWords: someCollection.filter(function(curArticle) {
      //  what do we return here to check for matching authors?
      // })
      // .map(...) // use .map to return the author's word count for each article's body (hint: regexp!).
      // .reduce(...) // squash this array of numbers into one big number!
      };
    });
  };

  module.Article = Article;
})(window);
