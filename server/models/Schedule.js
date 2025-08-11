const mongoose = require('mongoose');

// MongoDB Schema using Mongoose
const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    default: '#3B82F6'
  }
});

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  hour: {
    type: String,
    required: true
  },
  activity: activitySchema
});

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'My Weekly Schedule'
  },
  timeSlots: [timeSlotSchema],
  activities: [activitySchema],
  isTemplate: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
scheduleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance methods
scheduleSchema.methods.addTimeSlot = function(day, hour, activity) {
  // Remove existing time slot if it exists
  this.timeSlots = this.timeSlots.filter(
    slot => !(slot.day === day && slot.hour === hour)
  );
  
  // Add new time slot
  this.timeSlots.push({ day, hour, activity });
  return this.save();
};

scheduleSchema.methods.removeTimeSlot = function(day, hour) {
  this.timeSlots = this.timeSlots.filter(
    slot => !(slot.day === day && slot.hour === hour)
  );
  return this.save();
};

scheduleSchema.methods.addActivity = function(name, color) {
  const activity = { name, color };
  this.activities.push(activity);
  return this.save();
};

// Static methods
scheduleSchema.statics.findTemplates = function() {
  return this.find({ isTemplate: true });
};

scheduleSchema.statics.findUserSchedules = function() {
  return this.find({ isTemplate: false });
};

module.exports = mongoose.model('Schedule', scheduleSchema);