var mongoose = require('mongoose');

// product schema
var ProductSchema = mongoose.Schema({

  title: {
    type: String,
    require: true
  },
  slug: {
    type: String
  },
  desc: {
    type: String,
    require: true
  },
  category: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    require: true
  },
  image: {
    type: String
  }

});

var Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
