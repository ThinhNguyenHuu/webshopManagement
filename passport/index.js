const { ObjectId } = require('mongodb');
const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
  
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, 
  async function(username, password, done) {
    const user = await userModel.findOne({email: username});

    if(!user) {
      return done(null, false, { message: 'Người dùng không tồn tại' });
    }

    // const checkPassword = await bcrypt.compare(password, user.password);
    // if(!checkPassword) {
    //   return done(null, false, { message: 'Sai mật khẩu' });
    // }

    return done(null, user);
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  userModel.findOne({_id: ObjectId(id)}).then(user => {
    done(null, user);
  })
});

module.exports = passport;