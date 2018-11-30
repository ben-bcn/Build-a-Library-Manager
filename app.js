const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// by default the /views folder will be used
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use('/static',express.static('public'));

// since our routes file is called index.js we don't need to add it to the path
const mainRoutes = require('./routes');
const books = require('./routes/books');

app.use(mainRoutes);
app.use('/books',books);


// catching 404 errors & passing off to error handler middleware
app.use((req, res, next) => {
  const err = new Error('The Page Is Not found');
  err.status = 404;
  next(err);
});

// Custom error handler, basically middleware but with 4 arguements
app.use((err, req, res, next) => {
  res.locals.error = err;
  if (err.status >= 100 && err.status < 600)
    res.status(err.status);
  else
    res.status(500);
  console.log(err.message);
  console.log(req.originalUrl+" does not exist.");
  res.render('error');
});

app.listen(3000, () => {
  console.log('The application is listening to port 3000');
});
