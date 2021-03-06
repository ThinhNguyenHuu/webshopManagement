const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
  
const userModel = require('../models/userModel');

passport.use(new LocalStrategy(
  async function(username, password, done) {
    const { error, result } = await userModel.checkCredential(password, username);
  
    if (error)
      return done(null, false, { message: error });
    return done(null, result);
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  userModel.findOne(id).then(user => {
    done(null, user);
  })
});

module.exports = passport;