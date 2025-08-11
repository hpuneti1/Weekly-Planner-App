const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');

// GET /api/schedules - Get all schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.findUserSchedules();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/schedules/:id - Get specific schedule
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/schedules - Create new schedule
router.post('/', async (req, res) => {
  try {
    const { title, timeSlots, activities, isTemplate } = req.body;
    
    const schedule = new Schedule({
      title: title || 'My Weekly Schedule',
      timeSlots: timeSlots || [],
      activities: activities || [],
      isTemplate: isTemplate || false
    });
    
    const savedSchedule = await schedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/schedules/:id - Update schedule
router.put('/:id', async (req, res) => {
  try {
    const { title, timeSlots, activities, isTemplate } = req.body;
    
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        title,
        timeSlots,
        activities,
        isTemplate,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/schedules/:id - Delete schedule
router.delete('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/schedules/:id/timeslots - Add time slot to schedule
router.post('/:id/timeslots', async (req, res) => {
  try {
    const { day, hour, activity } = req.body;
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    await schedule.addTimeSlot(day, hour, activity);
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/schedules/:id/timeslots - Remove time slot
router.delete('/:id/timeslots', async (req, res) => {
  try {
    const { day, hour } = req.body;
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    await schedule.removeTimeSlot(day, hour);
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/schedules/templates - Get all templates
router.get('/templates/all', async (req, res) => {
  try {
    const templates = await Schedule.findTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;