import { useState, useEffect } from 'react';

export const useSchedule = () => {
  // State for the weekly schedule (stores activities by time slot)
  const [schedule, setSchedule] = useState({});
  
  // State for available activities library
  const [activities, setActivities] = useState([
    { id: 1, name: 'Meeting', color: '#3B82F6' },
    { id: 2, name: 'Work', color: '#10B981' },
    { id: 3, name: 'Gym', color: '#F59E0B' },
    { id: 4, name: 'Study', color: '#8B5CF6' }
  ]);
  
  // Counter for creating new activity IDs
  const [nextId, setNextId] = useState(5);

  // Load data from localStorage when component mounts
  useEffect(() => {
    const savedSchedule = localStorage.getItem('weeklySchedule');
    const savedActivities = localStorage.getItem('activities');
    
    if (savedSchedule) {
      try {
        setSchedule(JSON.parse(savedSchedule));
      } catch (e) {
        console.error('Error loading schedule:', e);
      }
    }
    
    if (savedActivities) {
      try {
        setActivities(JSON.parse(savedActivities));
      } catch (e) {
        console.error('Error loading activities:', e);
      }
    }
  }, []);

  // Save schedule to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('weeklySchedule', JSON.stringify(schedule));
  }, [schedule]);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  // Add an activity to a specific time slot
  const addActivity = (day, hour, activity) => {
    const key = `${day}-${hour}`;
    console.log('Adding activity:', activity, 'to slot:', key);
    
    setSchedule(prev => ({
      ...prev,
      [key]: activity
    }));
  };

  // Remove an activity from a specific time slot
  const removeActivity = (day, hour) => {
    const key = `${day}-${hour}`;
    console.log('Removing activity from slot:', key);
    
    setSchedule(prev => {
      const newSchedule = { ...prev };
      delete newSchedule[key];
      return newSchedule;
    });
  };

  // Create a new activity type
  const createActivity = (name, color) => {
    const newActivity = {
      id: nextId,
      name: name.trim(),
      color: color
    };
    
    console.log('Creating new activity:', newActivity);
    
    setActivities(prev => [...prev, newActivity]);
    setNextId(prev => prev + 1);
  };

  // Clear the entire schedule
  const clearSchedule = () => {
    console.log('Clearing entire schedule');
    setSchedule({});
  };

  // Get analytics data for charts
  const getScheduleData = () => {
    const totalSlots = Object.keys(schedule).length;
    const activityCounts = {};
    
    // Count how many times each activity appears
    Object.values(schedule).forEach(activity => {
      activityCounts[activity.name] = (activityCounts[activity.name] || 0) + 1;
    });

    // Format data for charts
    const chartData = Object.entries(activityCounts).map(([name, count]) => ({
      name,
      count,
      percentage: totalSlots > 0 ? Math.round((count / totalSlots) * 100) : 0
    }));

    return {
      totalSlots,
      activityCounts,
      activities: chartData
    };
  };

  return {
    schedule,
    activities,
    addActivity,
    removeActivity,
    createActivity,
    clearSchedule,
    getScheduleData
  };
};