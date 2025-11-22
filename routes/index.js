const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');

const basic = auth.basic({
  realm: 'Registrants',
  file: path.join(__dirname, '../users.htpasswd'),
});

// Simple Kitchen homepage
router.get('/', (req, res) => {
  res.render('index', { title: 'Simple Kitchen' });
});

// Registration form page
router.get('/register', (req, res) => {
  res.render('form', {
    title: 'Register to subscribe',
    errors: [],
    data: {},
  });
});

// Handle form submit
router.post(
  '/register',
  [
    check('name')
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),
    check('email')
      .isLength({ min: 1 })
      .withMessage('Please enter an email'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('form', {
        title: 'Register to subscribe',
        errors: errors.array(),
        data: req.body,
      });
    }

    try {
      const registration = new Registration(req.body);
      await registration.save();
      res.redirect('/thankyou');
    } catch (err) {
      console.error(err);
      res.render('form', {
        title: 'Register to subscribe',
        errors: [{ msg: 'Sorry! Something went wrong.' }],
        data: req.body,
      });
    }
  }
);

// Thank-you page
router.get('/thankyou', (req, res) => {
  res.render('thankyou', { title: 'Thank you for your registration!' });
});

// Protected registrants list
router.get(
  '/registrants',
  basic.check(async (req, res) => {
    try {
      const registrations = await Registration.find();
      res.render('registrants', {
        title: 'Listing registrations',
        registrations,
      });
    } catch (err) {
      console.error(err);
      res.send('Sorry! Something went wrong.');
    }
  })
);

module.exports = router;
