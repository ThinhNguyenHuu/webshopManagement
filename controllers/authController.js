
module.exports.get_login = async (req, res, next) => {
  res.render('auth/login', { 
    layout: false,
    error: req.flash('error')
  });
}

module.exports.logout = async (req, res, next) => {
  req.logout();
  res.redirect('/auth/login');
}