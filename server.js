// require and instantiate express
var express = require('express');
// grab the url model
var Url = require('./url');
var mongoose = require('mongoose');
var path = require('path')
var app = express();
var dbUrl = process.env.MONGOLAB_URI
var port = process.env.PORT || 8080


// create a connection to our MongoDB
mongoose.connect(dbUrl);

app.get('/', function(req, res){
  // route to serve up the homepage (index.html)
  res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/api/*', function(req, res){
  // route to create and return a shortened URL given a long URL
  var originalUrl = req.params[0]
  var shortUrl = ''
  var hostUrl = req.protocol + '://' + req.hostname + '/'
  
  // check if url already exists in database
  Url.findOne({original_url: originalUrl}, function (err, doc){
    if (doc){
      // URL has already been saved
      console.log('doc:', doc)
      shortUrl = hostUrl + doc._id
      res.send({
        original_url: originalUrl,
        short_url: shortUrl
      })
    } else {
      // The original URL was not found in the original_url field in our urls
      // collection, so we need to create a new entry
      var newUrl = Url({
        original_url: originalUrl
      });

      // save the new link
      newUrl.save(function(err) {
        if (err){
          console.log(err);
        }
        
        console.log('newUrl:', newUrl)

        // construct the short URL
        shortUrl = hostUrl + newUrl._id;

        res.send({
          original_url: originalUrl,
          short_url: shortUrl
        })
      });
    }
  });
});

app.get('/:id', function(req, res){
  // route to redirect the visitor to their original URL given the short URL
  var id  = req.params.id
  
  // check if url already exists in database
  Url.findOne({_id: id}, function (err, doc){
    if (doc) {
      // found an entry in the DB, redirect the user to their destination
      res.redirect(doc.original_url);
    } else {
      // nothing found, take 'em home
      res.redirect('/');
    }
  });
});

app.listen(port, function(){
  console.log('Server listening on port 8080');
});