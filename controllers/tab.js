const { validationResult } = require('express-validator');

const Tab = require('../models/tab');
const Bookmark = require('../models/bookmark');
const Category = require('../models/category');
const User = require('../models/user');

exports.getTabs = (req, res, next) => {

  Tab.find({ creator: req.userId })
    .then(tabs => {
      res.status(200).json({
        message: 'Fetch tabs successfully',
        tabs: tabs
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.getTab = (req, res, next) => {
  const { tabId } = req.params;
  Tab.findById(tabId)
    .then(tab => {
      if (!tab) {
        const error = new Error('Could not find tab');
        error.statusCode = 404;
        throw error;
      }
      if (tab.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!')
        error.statusCode = 403;
        throw error;
      }
      res.status(200).json({
        message: 'Fetch tab successfully',
        tab: tab
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.createTab = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg)
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { title } = req.body;
  const tab = new Tab({
    title: title,
    creator: req.userId
  })
  tab.save()
    // .then(() => {
    //   return User.findById(req.userId)
    // })
    // .then(user => {
    //   creator = user;
    //   user.tabs.push(tab);
    //   return user.save();
    // })
    .then(result => {
      return res.status(201).json({
        message: 'Tab created successfully!',
        tab: tab,
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.deleteTab = (req, res, next) => {
  const { tabId } = req.params;

  let loadedTab;
  Tab.findById(tabId)
    .then(tab => {
      if (!tab) {
        const error = new Error('Tab not Found!');
        error.statusCode = 422;
        throw error;
      }
      if (tab.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!')
        error.statusCode = 403;
        throw error;
      }
      loadedTab = tab;
      return Tab.findByIdAndRemove(tabId);
    })
    .then(result => {
      return Category.find({ _id: { $in: loadedTab.categories } })
        .populate('categories')
      // .execPopulate()
    })
    .then(categories => {
      const bookmarks = [];
      categories.forEach(category => {
        // bookmarks.concat(category.bookmarks)
        bookmarks.push(...category.bookmarks)
      })
      // console.log(bookmarks)
      return Bookmark.deleteMany({ _id: { $in: bookmarks } })
    })
    .then(result => {
      return Category.deleteMany({ _id: { $in: loadedTab.categories } })
    })
    .then(result => {
      res.status(200).json({
        message: 'Tab Deleted!',
        bookmark: loadedTab
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}