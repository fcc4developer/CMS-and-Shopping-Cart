var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');
var fileUpload = require('express-fileupload');
var passport = require('passport');

// set routes
var pages = require('./routes/pages');
var products = require('./routes/products');
var cart = require('./routes/cart');
var users = require('./routes/users');
var adminPages = require('./routes/admin-pages');
var adminCategories = require('./routes/admin-categories');
var adminProducts = require('./routes/admin-products');

// connect to db
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// init app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// set global errors variable
app.locals.errors = null;

// get Page model
var Page = require('./models/page');

// get all pages to pass to header.ejs
Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
  if (err) {
    console.log(err);
  } else {
    app.locals.pages = pages;
  }
});

// get Category model
var Category = require('./models/category');

// get all categories to pass to header.ejs
Category.find({}, function (err, categories) {
  if (err) {
    console.log(err);
  } else {
    app.locals.categories = categories;
  }
});

// Express fileUpload middleware
app.use(fileUpload());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// handle express sessions
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true,
  // cookie: { secure: true }
}));

// validator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  },

  customValidators: {
    isImage: function (value, filename) {
      var extension = (path.extname(filename)).toLowerCase();

      switch (extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        case '':
          return '.jpg';
        default:
          return false;
      }
    }

  }
}));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// passport config
require('./config/passport')(passport);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// set cart locals
app.get('*', function (req, res, next) {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

// use routes
app.use('/admin/products', adminProducts);
app.use('/admin/categories', adminCategories);
app.use('/admin/pages', adminPages);
app.use('/users', users);
app.use('/cart', cart);
app.use('/products', products);
app.use('/', pages);


// start the server
var port = 3000;
app.listen(port, function (req, res) {
  console.log('Server started on port ' + port);
});