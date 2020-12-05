const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const hbs = require('hbs');

const indexRouter = require('./routes/index');
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/category');
const brandRouter = require('./routes/brand');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1.equals(arg2)) ? options.fn(this) : options.inverse(this);
});



app.use(fileupload({ useTempFiles: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/product', productRouter);
app.use('/category', categoryRouter);
app.use('/brand', brandRouter);

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
