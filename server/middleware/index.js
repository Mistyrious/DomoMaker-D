const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    // redirects if not logged in
    return res.redirect('/');
  }
  return next();
};

const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    // redirects if already logged in
    return res.redirect('/maker');
  }
  return next();
};

// normally check if req.secure is true, but heroku enviroment is encrypted internally
// so it would always be true. isntead, we check to see if the forwareded req thru heroku
// was secure by checking the request's x-forwarded-proto header

const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};

const bypassSecure = (req, res, next) => {
  next();
};

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;

if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
