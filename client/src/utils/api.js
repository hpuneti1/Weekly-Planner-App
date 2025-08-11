// Frontend API service to communicate with backend
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // Test backend connection
  static async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/test`);
      const data = await response.json();
      console.log('Backend connection test:', data);
      return data;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return null;
    }
  }

  // Save schedule to backend
  static async saveSchedule(scheduleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'My Weekly Schedule',
          timeSlots: this.convertScheduleToTimeSlots(scheduleData.schedule),
          activities: scheduleData.activities,
          isTemplate: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Schedule saved to database:', result);
      return result;
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  }

  // Load schedules from backend
  static async loadSchedules() {
    try {
      const response = await fetch(`${API_BASE_URL}/schedules`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const schedules = await response.json();
      console.log('Schedules loaded from database:', schedules);
      return schedules;
    } catch (error) {
      console.error('Error loading schedules:', error);
      throw error;
    }
  }

  // Convert frontend schedule format to backend timeSlots format
  static convertScheduleToTimeSlots(schedule) {
    const timeSlots = [];
    
    Object.entries(schedule).forEach(([key, activity]) => {
      const [day, hour] = key.split('-');
      timeSlots.push({
        day,
        hour,
        activity: {
          name: activity.name,
          color: activity.color
        }
      });
    });

    return timeSlots;
  }

  // Convert backend timeSlots format to frontend schedule format
  static convertTimeSlotsToSchedule(timeSlots) {
    const schedule = {};
    
    timeSlots.forEach(slot => {
      const key = `${slot.day}-${slot.hour}`;
      schedule[key] = slot.activity;
    });

    return schedule;
  }
}

export default ApiService;