const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const signupPage = (req, res) => {
  res.render('signup', { csrfToken: req.csrfToken() });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use.' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const changePass = async (req, res) => {
  const oldPass = `${req.body.oldPass}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  const user = req.session.account._id;

  if (!oldPass || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'New passwords do not match!' });
  }

  let doc;

  try {
    doc = await Account.findById(user).exec();
    // doc = await AccountModel.findOne({ user }).exec();

    Account.authenticate(doc.username, pass, (err, account) => {
      if (err || !account) {
        return res.status(401).json({ error: 'Password incorrect' });
      }
      return null;
    });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong.' });
  }

  try {
    const hash = await Account.generateHash(pass);
    doc.password = hash;
    await doc.save();
    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const getToken = (req, res) => res.json({ csrfToken: req.csrfToken() });

module.exports = {
  loginPage,
  signupPage,
  login,
  logout,
  signup,
  changePass,
  getToken,
};
