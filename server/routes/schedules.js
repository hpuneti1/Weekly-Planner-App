const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');

// Simple POST route
router.post('/', async (req, res) => {
  try {
    console.log('Received schedule data:', req.body);
    
    // Create a new schedule document
    const schedule = new Schedule({
      title: req.body.title || 'Weekly Schedule',
      data: req.body,
      createdAt: new Date()
    });
    
    const savedSchedule = await schedule.save();
    console.log('Schedule saved to database:', savedSchedule._id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Schedule saved successfully',
      id: savedSchedule._id 
    });
  } catch (error) {
    console.error('Database save error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save schedule',
      message: error.message 
    });
  }
});

// Simple GET route
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find().limit(10).sort({ createdAt: -1 });
    console.log('Found', schedules.length, 'schedules');
    
    res.json({
      success: true,
      count: schedules.length,
      schedules: schedules
    });
  } catch (error) {
    console.error('Database read error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load schedules' 
    });
  }
});

module.exports = router;