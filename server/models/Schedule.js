const mongoose = require('mongoose');

// MongoDB Schema
const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Weekly Schedule'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);