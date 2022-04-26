const express = require('express');
const { body } = require('express-validator')

const tabController = require('../controllers/tab');
const Tab = require('../models/tab');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', isAuth, tabController.getTabs)

router.get('/:tabId', isAuth, tabController.getTab)

router.post('/', isAuth, [
  body('title')
    .isString()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be minimum of 3 charcater')
    .custom((value, { req }) => {
      return Tab.findOne({ title: value })
        .then(tab => {
          if (tab) {
            return Promise.reject('Tab already exists.')
          }
          return true;
        })
    })
], tabController.createTab);

router.delete('/:tabId', isAuth, tabController.deleteTab)


module.exports = router;