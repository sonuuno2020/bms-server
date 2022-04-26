const express = require('express');
const { body } = require('express-validator')

const authController = require('../controllers/auth');
const User = require('../models/user')
const Tab = require('../models/tab');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put('/signup', [
  body('email').isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid emial.')
    .custom((value, { res }) => {
      return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
          return Promise.reject('Email address already exits!')
        }
        return true;
      })
    }),
  body('password')
    .trim()
    .isLength({ min: 5 }),
  body('name')
    .trim()
    .not()
    .isEmpty()

], authController.signup);

router.post('/login', [
  body('email').isEmail()
    .withMessage('Please enter a valid emial.')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Password must be minimum 5 character.'),
], authController.login)

router.get('/users', isAuth, authController.getUsers)

router.get('/user', isAuth, authController.getUser)

router.delete('/user/:deleteUserId', isAuth, authController.deleteUser)

router.put('/change-password', isAuth, [
  body('oldPassword')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Password must be minimum 5 character.'),
  body('newPassword')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Password must be minimum 5 character.'),
], authController.changePassword)


module.exports = router;