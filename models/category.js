const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  bookmarks: [{
    type: Schema.Types.ObjectId,
    ref: 'Bookmark'
  }],
  tab: {
    type: Schema.Types.ObjectId,
    ref: 'Tab'
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Category', categorySchema);
