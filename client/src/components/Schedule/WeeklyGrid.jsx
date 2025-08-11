import React, { useState } from 'react';
import { useSchedule } from '../../hooks/useSchedule';

const WeeklyGrid = () => {
  const { schedule, addActivity, activities, createActivity, removeActivity } = useSchedule();
  const [newActivityName, setNewActivityName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  // Days and hours for the grid
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

  // Handle creating new activities
  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (newActivityName.trim()) {
      createActivity(newActivityName, selectedColor);
      setNewActivityName('');
    }
  };

  // Handle dragging from activity library
  const handleLibraryDragStart = (e, activity) => {
    e.dataTransfer.setData('activityData', JSON.stringify(activity));
    e.dataTransfer.setData('source', 'library');
    console.log('Started dragging from library:', activity.name);
  };

  // Handle dragging from schedule slots
  const handleScheduleDragStart = (e, day, hour) => {
    const slotKey = `${day}-${hour}`;
    const activity = schedule[slotKey];
    
    if (activity) {
      e.dataTransfer.setData('activityData', JSON.stringify(activity));
      e.dataTransfer.setData('source', 'schedule');
      e.dataTransfer.setData('sourceSlot', slotKey);
      console.log('Started dragging from schedule:', activity.name, 'at', slotKey);
    }
  };

  // Handle dropping on schedule slots
  const handleScheduleDrop = (e, day, hour) => {
    e.preventDefault();
    
    const activityData = e.dataTransfer.getData('activityData');
    const source = e.dataTransfer.getData('source');
    const sourceSlot = e.dataTransfer.getData('sourceSlot');
    const targetSlot = `${day}-${hour}`;
    
    console.log('Drop on schedule:', { source, sourceSlot, targetSlot });
    
    if (activityData) {
      const activity = JSON.parse(activityData);
      
      // If moving from another schedule slot, remove from old location first
      if (source === 'schedule' && sourceSlot && sourceSlot !== targetSlot) {
        const [sourceDay, sourceHour] = sourceSlot.split('-');
        removeActivity(sourceDay, sourceHour);
      }
      
      // Add to new location
      addActivity(day, hour, activity);
    }
  };

  // Handle dropping on removal zone
  const handleRemovalDrop = (e) => {
    e.preventDefault();
    
    const source = e.dataTransfer.getData('source');
    const sourceSlot = e.dataTransfer.getData('sourceSlot');
    
    console.log('Drop on removal zone:', { source, sourceSlot });
    
    if (source === 'schedule' && sourceSlot) {
      const [sourceDay, sourceHour] = sourceSlot.split('-');
      removeActivity(sourceDay, sourceHour);
      console.log('Removed activity from:', sourceSlot);
    }
  };

  // Allow drop events
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Weekly Schedule Planner
        </h1>
        
        {/* Activity Creator Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create New Activity</h2>
          
          {/* Create Activity Form */}
          <form onSubmit={handleCreateActivity} className="flex flex-wrap gap-4 items-end mb-6">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Name</label>
              <input
                type="text"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., Team Meeting, Workout, Study Time"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              ✚ Create Activity
            </button>
          </form>
          
          {/* Activity Library */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Activity Library (Drag to Schedule)
            </h3>
            <div className="flex gap-3 flex-wrap mb-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  draggable
                  onDragStart={(e) => handleLibraryDragStart(e, activity)}
                  className="px-4 py-2 rounded-lg cursor-move shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium text-sm text-white"
                  style={{ backgroundColor: activity.color }}
                >
                  {activity.name}
                </div>
              ))}
            </div>
            
            {/* Removal Zone */}
            <div 
              className="p-4 border-2 border-dashed border-red-300 rounded-lg bg-red-50 text-center text-red-600 hover:bg-red-100 transition-colors"
              onDrop={handleRemovalDrop}
              onDragOver={handleDragOver}
            >
               <strong>Drag activities here to remove them from schedule</strong>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header Row */}
          <div className="grid grid-cols-8 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
            <div className="p-4 font-bold text-center border-r border-gray-600">Time</div>
            {days.map((day) => (
              <div key={day} className="p-4 font-bold text-center border-r border-gray-600 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          {/* Schedule Grid Rows */}
          {hours.map((hour, hourIndex) => (
            <div key={hour} className={`grid grid-cols-8 border-b border-gray-200 ${hourIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              {/* Time Column */}
              <div className="p-4 text-sm font-semibold text-gray-700 bg-gray-100 border-r border-gray-200 flex items-center">
                {hour}
              </div>
              
              {/* Day Columns */}
              {days.map((day) => {
                const slotKey = `${day}-${hour}`;
                const activity = schedule[slotKey];
                
                return (
                  <div
                    key={slotKey}
                    onDrop={(e) => handleScheduleDrop(e, day, hour)}
                    onDragOver={handleDragOver}
                    className="p-2 h-20 border-r border-gray-200 last:border-r-0 hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center group"
                  >
                    {activity ? (
                      <div
                        draggable
                        onDragStart={(e) => handleScheduleDragStart(e, day, hour)}
                        className="w-full h-full rounded-lg px-3 py-2 text-xs text-white flex items-center justify-center font-medium shadow-sm border-2 border-white cursor-move hover:shadow-md transition-shadow"
                        style={{ backgroundColor: activity.color }}
                        title={`${activity.name} - Drag to move or remove`}
                      >
                        {activity.name}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:text-gray-400 transition-colors">
                        <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 bg-white px-6 py-3 rounded-lg shadow-sm inline-block">
            <strong>How to use:</strong> Drag activities from the library to schedule them. 
            <br />
            <strong>To move:</strong> Drag activities between time slots. 
            <strong>To remove:</strong> Drag to the red removal zone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyGrid;