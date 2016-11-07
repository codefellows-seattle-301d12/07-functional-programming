(function(module){
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

  Article.loadAll = function(dataWePassIn) {
    Article.allArticles = dataWePassIn.sort(function(a,b) {
      return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
    }).map(function(ele) {
      return new Article(ele);
    });
  };

  Article.fetchAll = function(next) {
    if (localStorage.hackerIpsum) {
      $.ajax({
        type: 'HEAD',
        url: '/data/hackerIpsum.json',
        success: function(data, message, xhr) {
          var eTag = xhr.getResponseHeader('eTag');
          if (!localStorage.eTag || eTag !== localStorage.eTag) {
            Article.getAll(); //TODO: next needs to be passed into Article.getAll();
          } else {
            Article.loadAll(JSON.parse(localStorage.hackerIpsum));
            next();
          }
        }
      });
    } else {
      Article.getAll(); //TODO: next needs to be passed into Article.getAll();
    }
  };

  Article.getAll = function(next) {
    $.getJSON('/data/hackerIpsum.json', function(responseData, message, xhr) {
      localStorage.eTag = xhr.getResponseHeader('eTag');
      Article.loadAll(responseData);
      localStorage.hackerIpsum = JSON.stringify(responseData);
      next();
    });
  };

  Article.numWordsAll = function() {
    return Article.allArticles.map(function(article) {
      return article.body.split(' ').length;
    }); //This semicolon needs to be removed
    .reduce(function(current, next, idx, array) {
      return (current + next);
    });
  };

  Article.allAuthors = function() {
    return Article.allArticles.map(function(article){
      return article.author;
    }).reduce(function(acc, next, idx, array){
      if(array.indexOf(next) === idx){
        acc.push(next);
      };
      return acc;
    }, []);
  };

  Article.numWordsByAuthor = function() {
    Article.allAuthors().map(function(author) { //A return needs to be added to the beginning of this line
      return {
        name: author; //This semicolon needs to be changed to a comma
        numWords: Article.allArticles.filter(function(curArticle) {
          return curArticle.author === author;
        }).map(function(article) {
          return article.body.split(' ').length;
        }).reduce(function(acc, next, idx, array) {
          return acc + next;
        })
      };
    });
  };
  module.Article = Article;
})(window);
