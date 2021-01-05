require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const hbs = require('hbs');
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('./passport/index');
const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/category');
const brandRouter = require('./routes/brand');
const userRouter = require('./routes/user');
const orderRouter = require('./routes/order');
const statisticRouter = require('./routes/statistic');
const apiRouter = require('./api');
const {ensureAuthenticated} = require('./middlewares/authenticationMiddleware');
const { ObjectId } = require('mongodb');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerHelper('strEquals', function(arg1, arg2, options) {
  return arg1.localeCompare(arg2) == 0 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('strInclude', function(arg1, arg2, options) {
  return arg1.includes(arg2) ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('idEquals', function(arg1, arg2, options) {
  if (!ObjectId.isValid(arg2))  return options.inverse(this);
  return ObjectId(arg1).equals(ObjectId(arg2)) ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('dateToString', function(arg) {
  return [("0" + arg.getDate()).slice(-2), ("0" + (arg.getMonth() + 1)).slice(-2), arg.getFullYear()].join('/') + ' - ' 
    + ("0" + arg.getHours()).slice(-2) + ':' + ("0" + arg.getMinutes()).slice(-2);
});
hbs.registerHelper('formatPrice', function(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}); 

app.use(fileupload({ useTempFiles: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport middlewares
app.use(session({ 
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Pass req.user to res.locals
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.use('/auth', authRouter);
app.use('/', ensureAuthenticated, indexRouter);
app.use('/product', ensureAuthenticated, productRouter);
app.use('/category', ensureAuthenticated, categoryRouter);
app.use('/brand', ensureAuthenticated, brandRouter);
app.use('/user', ensureAuthenticated, userRouter);
app.use('/order', ensureAuthenticated, orderRouter);
app.use('/statistic', ensureAuthenticated, statisticRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
