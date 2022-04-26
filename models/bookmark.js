const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookmarkSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: 'note'
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    tags: [String],
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bookmark', bookmarkSchema);
