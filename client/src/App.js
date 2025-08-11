import React from 'react';
import WeeklyGrid from './components/Schedule/WeeklyGrid';
import TimeChart from './components/Schedule/TimeChart';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <WeeklyGrid />
      </div>
    </div>
  );
}

export default App;