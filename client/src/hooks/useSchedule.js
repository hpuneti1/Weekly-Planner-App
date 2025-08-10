import { useState, useEffect } from 'react';

export const useSchedule = () => {
  // State Management with Hooks
  const [schedule, setSchedule] = useState({});
  const [activities, setActivities] = useState([
    { id: 1, name: 'Meeting', color: '#3B82F6' },
    { id: 2, name: 'Work', color: '#10B981' },
    { id: 3, name: 'Exercise', color: '#F59E0B' },
    { id: 4, name: 'Study', color: '#8B5CF6' }
  ]);
  const [nextId, setNextId] = useState(5);


  useEffect(() => {
    const savedSchedule = localStorage.getItem('weeklySchedule');
    const savedActivities = localStorage.getItem('activities');
    
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    }
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('weeklySchedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  // Custom hook functions
  const addActivity = (day, hour, activity) => {
    const key = `${day}-${hour}`;
    setSchedule(prev => ({
      ...prev,
      [key]: activity
    }));
  };

  const removeActivity = (day, hour) => {
    const key = `${day}-${hour}`;
    setSchedule(prev => {
      const newSchedule = { ...prev };
      delete newSchedule[key];
      return newSchedule;
    });
  };

  const createActivity = (name, color) => {
    const newActivity = {
      id: nextId,
      name: name,
      color: color
    };
    setActivities(prev => [...prev, newActivity]);
    setNextId(prev => prev + 1);
  };

  const clearSchedule = () => {
    setSchedule({});
  };

  const getScheduleData = () => {
    const totalSlots = Object.keys(schedule).length;
    const activityCounts = {};
    
    Object.values(schedule).forEach(activity => {
      activityCounts[activity.name] = (activityCounts[activity.name] || 0) + 1;
    });

    return {
      totalSlots,
      activityCounts,
      activities: Object.entries(activityCounts).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalSlots) * 100) || 0
      }))
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