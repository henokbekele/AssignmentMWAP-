var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var MongoClient = require('mongodb').MongoClient;

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', index);
app.use('/users', users);

app.get('/', function (req, res, next) {
  res.render('add')
})

app.post('/add', function (req, res, nex) {
  MongoClient.connect('mongodb://127.0.0.1:27017/orgDB', function (err, db) {
    if (err) throw err;
    var doc = {
      name: req.body.name,
      category: req.body.category,
      loc: [req.body.longitude, req.body.latitude]
    };
    db.collection('orgCol').insert(doc, function (err, inserteddoc) {
      if (err) throw err;
      db.close();
      res.send(JSON.stringify(inserteddoc.ops));
    });
  });
})

app.get('/search', function (req, res, next) {
  MongoClient.connect('mongodb://127.0.0.1:27017/orgDB', function (err, db) {
    if (err) throw err;
    var query = { name: req.query.name }
    console.log("queryyyyyy" + JSON.stringify(query))
    db.collection('orgCol').find(query, function (err, searchdoc) {
      if (err) throw err;
      
     searchdoc.toArray(function (err, arrydoc) {
        if (err) throw err;
        res.send((JSON.stringify(arrydoc)));
      })
db.close();
    })
  });
})

//update
app.post('/update', function(req, res, next){
  MongoClient.connect('mongodb://127.0.0.1:27017/orgDB', function(err, db){
    if(err) throw err;
    var query={name:req.body.name}
    var operator={'$set':{category:req.body.category}}
    db.collection('orgCol').update(query, operator,function(err, updoc){
      if(err) throw err;

       db.close();
      res.send((JSON.stringify(updoc))+"Is updated in the collections")
    })
  })
})

app.post('/delete', function (req, res, next) {
  MongoClient.connect('mongodb://127.0.0.1:27017/orgDB', function (err, db) {
    if (err) throw err;
    var query = { name: req.body.name }

    db.collection('orgCol').remove(query, function (err, removeddoc) {
      if (err) throw err;
 
       db.close();
      res.send((JSON.stringify(removeddoc))+"Is removed from the collections")

    })
  });
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(300, () => { console.log("server started") })
module.exports = app;
