const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const csrf = require('csurf');

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/DomoMaker';
mongoose.connect(dbURI, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

const redisURL = process.env.REDISCLOUD_URL;

const redisClient = redis.createClient({
  legacyMode: true,
  url: redisURL,
});
redisClient.connect().catch(console.error);

const app = express();

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

app.use(session({
  key: 'sessionid', // default is coonect.sid, which is a mild security flaw
  // bc it tells u what modules/frameworks they should be looking for security holes in

  store: new RedisStore({ // stores everything in a redis database instead of server vars
    client: redisClient,
  }),

  secret: 'Domo Arigato', // private string used as a seed for hashing/creating session keys
  resave: true, // tells session module to refresh the key to keep it active
  saveUninitialized: true, // tells module to make sessions even when not logged in
  // production systems would likely have the last two set to false, but need smth like Redis

  cookie: {
    httpOnly: true,
  },
}));

app.use(cookieParser());
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  console.log('Missing CSRF token!');
  return false;
});

router(app);

app.listen(port, (err) => {
  if (err) { throw err; }
  console.log(`Listening on port ${port}`);
});
