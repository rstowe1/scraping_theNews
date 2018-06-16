var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');


app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public')); // (create a public folder and land there)


app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

mongoose.connect('mongodb://localhost/scrapethenews');
var db = mongoose.connection;

db.on('error', function (err) {
  console.log('Mongoose Error: ', err);
});
db.once('open', function () {
  console.log('Mongoose connection successful.');
});


var Note = require('./models/note');
var Article = require('./models/articles');

// meat and potatoes



request('http://hiconsumption.com/category/gadgets/', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    console.log(html);
  }
});

app.get('/', function(req, res) {
  res.send(index.html); // sending the html file rather than rendering a handlebars file
});

app.get('/scrape', function(req, res) {
  request('http://www.echojs.com/', function(error, response, html) {
    var $ = cheerio.load(html);
    $('article h2').each(function(i, element) {

      var result = {};

      result.title = $(this).children('a').text();
      result.link = $(this).children('a').attr('href');

      var entry = new Article (result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
        }
      });


    });
  });
  res.send("Scrape Complete");
});


app.get('/articles', function(req, res){
  Article.find({}, function(err, doc){
    if (err){
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});


app.get('/h3/:id', function(req, res){
  Article.findOne({'_id': req.params.id})
    .populate('note')
    .exec(function(err, doc){
      if (err){
        console.log(err);
      } else {
        res.json(doc);
      }
    });
});


app.post('/h3/:id', function(req, res){
  var newNote = new Note(req.body);

  newNote.save(function(err, doc){
    if(err){
      console.log(err);
    } else {
      Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
        .exec(function(err, doc){
          if (err){
            console.log(err);
          } else {
            res.send(doc);
          }
        });

    }
  });
});



app.listen(56669, function() {
  console.log('Making it Rain on Port 56669!');
});