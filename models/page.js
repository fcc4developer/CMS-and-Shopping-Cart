var mongoose = require('mongoose');

// page schema
var PageSchema = mongoose.Schema({

  title: {
    type: String,
    require: true
  },
  slug: {
    type: String
  },
  content: {
    type: String,
    require: true
  },
  sorting: {
    type: Number
  },

});

var Page = mongoose.model("Page", PageSchema);

module.exports = Page;
