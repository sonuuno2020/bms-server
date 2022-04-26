const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tabSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Tab', tabSchema);
