var mongoose = require('mongoose');

// page schema
var UserSchema = mongoose.Schema({

  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  username: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  admin: {
    type: Number
  }

});

var User = mongoose.model("User", UserSchema);

module.exports = User;
