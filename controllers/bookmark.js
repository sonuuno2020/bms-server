const { validationResult } = require('express-validator');

const Bookmark = require('../models/bookmark');
const Category = require('../models/category');
const User = require('../models/user');


exports.getBookmarks = (req, res, next) => {
  Bookmark.find({ creator: req.userId })
    .then(bookmarks => {
      return res.status(200).json({
        message: 'Fetch bookmarks successfully',
        bookmarks: bookmarks
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.getBookmark = (req, res, next) => {
  const { bookmarkId } = req.params;
  Bookmark.findById(bookmarkId)
    .then(bookmark => {
      if (!bookmark) {
        const error = new Error('Could not find bookmark');
        error.statusCode = 404;
        throw error;
      }
      if (bookmark.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!')
        error.statusCode = 403;
        throw error;
      }
      return res.status(200).json({
        message: 'Fetch bookmark successfully',
        bookmark: bookmark
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.createBookmark = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg)
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { title, url, tags } = req.body;
  const bookmark = new Bookmark({
    title: title,
    url: url,
    tags: tags,
    category: req.body._id,
    creator: req.userId
  })

  Category.findById(req.body._id)
    .then(category => {
      if (!category) {
        const error = new Error('Category not Found!');
        error.statusCode = 404;
        throw error;
      }
      category.bookmarks.push(bookmark);
      return category.save();
    })
    .then(() => {
      return bookmark.save()
    })
    .then(result => {
      return res.status(201).json({
        message: 'Bookmark created successfully!',
        bookmark: bookmark,
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.deleteBookmark = (req, res, next) => {
  const { bookmarkId } = req.params;

  let loadedBookmark;
  return Bookmark.findById(bookmarkId)
    .then(bookmark => {
      if (!bookmark) {
        const error = new Error('Bookmark not Found!');
        error.statusCode = 422;
        throw error;
      }
      if (bookmark.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!')
        error.statusCode = 403;
        throw error;
      }
      loadedBookmark = bookmark;
      return Bookmark.findByIdAndRemove(bookmarkId);
    })
    .then(result => {
      return Category.findById(loadedBookmark.category);
    })
    .then(category => {
      category.bookmarks.pull(bookmarkId);
      return category.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'Bookmark Deleted!',
        bookmark: loadedBookmark
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}