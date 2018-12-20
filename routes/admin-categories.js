var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// get Category model
var Category = require('../models/category');

/*
* GET categories index
*/
router.get('/', isAdmin, function (req, res, next) {
  Category.find({}, function (err, categories) {
    if (err) return console.log(err);
    res.render('admin/categories', {
      categories: categories
    });
  });
});

/*
* GET add category
*/
router.get('/add-category', isAdmin, function (req, res, next) {

  var title = "";
  var image = ""

  Category.find({}, function (err, categories) {
    res.render('admin/add-category', {
      title: title,
      image: image,
      categories: categories
    });
  });

});

/*
* POST add category
*/
router.post('/add-category', function (req, res, next) {

  var categoryFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '';

  req.checkBody('title', 'Title must have a value').notEmpty();
  req.checkBody('image', 'You must upload an image').isImage(categoryFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();

  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/add-category', {
      errors: errors,
      title: title
    });
  } else {
    Category.findOne({ slug: slug }, function (err, category) {
      if (category) {
        req.flash('danger', 'Category title exists, choose another');
        res.render('admin/add-category', {
          title: title,
          slug: slug
        });
      } else {
        var category = new Category({
          title: title,
          slug: slug,
          image: categoryFile
        });

        category.save(function (err) {
          if (err) {
            return console.log(err);
          }
          Category.find({}, function (err, categories) {
            if (err) {
              console.log(err);
            } else {

              req.app.locals.categories = categories;

              mkdirp('public/category-images/' + category.slug, function (err) {
                return console.log();
              });
              mkdirp('public/category-images/' + category.slug + '/gallery', function (err) {
                return console.log();
              });
              mkdirp('public/category-images/' + category.slug + '/gallery/thumbs', function (err) {
                return console.log();
              });

              if (categoryFile != '') {
                var categoryImage = req.files.image;
                var path = 'public/category-images/' + category.slug + '/' + categoryImage;
                console.log(categoryImage)
                console.log(path)

                categoryImage.mv(path, function (err) {
                  return console.log(err);
                });
              }
            }
          });
          req.flash('success', 'Category added');
          res.redirect('/admin/categories');
        });
      }
    });
  }

});


/*
* GET edit category
*/
router.get('/edit-category/:id', isAdmin, function (req, res, next) {

  Category.findById(req.params.id, function (err, category) {
    if (err)
      return console.log(err);
    res.render('admin/edit-category', {
      title: category.title,
      id: category._id
    });

  });

});

/*
* POST edit category
*/
router.post('/edit-category/:id', function (req, res, next) {

  req.checkBody('title', 'Title must have a value').notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/edit-category', {
      errors: errors,
      title: title,
      id: id
    });
  } else {
    Category.findOne({ slug: slug, _id: { '$ne': id } }, function (err, category) {
      if (category) {
        req.flash('danger', 'Category title exists, choose another');
        res.render('admin/edit-category', {
          title: title,
          id: id
        });
      } else {

        Category.findById(id, function (err, category) {
          if (err)
            return console.log(err);

          category.title = title;
          category.slug = slug;

          category.save(function (err) {
            if (err)
              return console.log(err);
            Category.find({}, function (err, categories) {
              if (err) {
                console.log(err);
              } else {
                req.app.locals.categories = categories;
              }
            });

            req.flash('success', 'Category edited!');
            res.redirect('/admin/categories/edit-category/' + id);
          });
        });

      }
    });
  }

});

/*
/* GET delete category
*/
router.get('/delete-category/:id', isAdmin, function (req, res, next) {
  Category.findByIdAndRemove(req.params.id, function (err) {
    if (err) return
    console.log(err);
    Category.find({}, function (err, categories) {
      if (err) {
        console.log(err);
      } else {
        req.app.locals.categories = categories;
      }
    });

    req.flash('success', 'Category deleted!');
    res.redirect('/admin/categories');
  });
});


// exports
module.exports = router;