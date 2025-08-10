 
import React, { useState } from 'react';
import { useSchedule } from '../../hooks/useSchedule';

const WeeklyGrid = () => {
  const { schedule, addActivity, activities, createActivity } = useSchedule();
  const [newActivityName, setNewActivityName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

  // Event Handling: Form submission
  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (newActivityName.trim()) {
      createActivity(newActivityName, selectedColor);
      setNewActivityName('');
    }
  };

  // Event Handling: Drag and drop
  const handleDragStart = (e, activity) => {
    e.dataTransfer.setData('activity', JSON.stringify(activity));
  };

  const handleDrop = (e, day, hour) => {
    e.preventDefault();
    const activity = JSON.parse(e.dataTransfer.getData('activity'));
    addActivity(day, hour, activity);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  //Graphical Representation
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Weekly Schedule Planner</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Activity</h2>
        <form onSubmit={handleCreateActivity} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name</label>
            <input
              type="text"
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-48"
              placeholder="Enter activity name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Activity
          </button>
        </form>
        
        {/* Activity Library */}
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Available Activities</h3>
          <div className="flex gap-2 flex-wrap">
            {activities.map((activity) => (
              <div
                key={activity.id}
                draggable
                onDragStart={(e) => handleDragStart(e, activity)}
                className="px-3 py-2 rounded cursor-move shadow-sm border"
                style={{ backgroundColor: activity.color, color: 'white' }}
              >
                {activity.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 bg-gray-50">
          <div className="p-3 font-semibold text-gray-600">Time</div>
          {days.map((day) => (
            <div key={day} className="p-3 font-semibold text-center text-gray-700 border-l">
              {day}
            </div>
          ))}
        </div>
        
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-t">
            <div className="p-3 text-sm text-gray-600 bg-gray-50 border-r">
              {hour}
            </div>
            {days.map((day) => (
              <div
                key={`${day}-${hour}`}
                onDrop={(e) => handleDrop(e, day, hour)}
                onDragOver={handleDragOver}
                className="p-2 h-16 border-l hover:bg-blue-50 flex items-center justify-center"
              >
                {schedule[`${day}-${hour}`] && (
                  <div
                    className="w-full h-full rounded px-2 py-1 text-xs text-white flex items-center justify-center"
                    style={{ backgroundColor: schedule[`${day}-${hour}`].color }}
                  >
                    {schedule[`${day}-${hour}`].name}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyGrid;