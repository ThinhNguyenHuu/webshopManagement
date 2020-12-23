
module.exports.ensureAuthenticated = (req, res, next) => {
  if(!res.locals.user) res.redirect('/auth/login');
  else return next();
}