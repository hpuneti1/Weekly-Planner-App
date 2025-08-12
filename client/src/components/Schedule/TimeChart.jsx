import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const TimeChart = () => {
  const svgRef = useRef();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Process schedule data function (moved outside useEffect to avoid dependency issues)
  const processScheduleData = (scheduleData, colors) => {
    console.log('Processing schedule data:', scheduleData);
    
    if (!scheduleData || Object.keys(scheduleData).length === 0) {
      console.log('Schedule data is empty');
      setChartData([]);
      return;
    }

    // Count activities
    const activityCounts = {};
    
    Object.entries(scheduleData).forEach(([slot, activity]) => {
      if (activity && activity.name) {
        const activityName = activity.name;
        activityCounts[activityName] = (activityCounts[activityName] || 0) + 1;
      }
    });

    console.log('Activity counts:', activityCounts);

    // Convert to chart format with colors
    const newChartData = Object.entries(activityCounts).map(([name, count]) => ({
      name,
      count,
      color: colors[name] || '#6B7280' // Use stored color or default gray
    }));

    console.log('Final chart data:', newChartData);
    setChartData(newChartData);
  };

  // Fetch data directly from database
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        console.log('=== Fetching schedule data from database ===');
        
        const response = await fetch('http://localhost:5000/api/schedules');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Database response:', result);
        
        if (result.schedules && result.schedules.length > 0) {
          // Get the most recent schedule
          const latestSchedule = result.schedules[0];
          console.log('Latest schedule:', latestSchedule);
          
          // Extract schedule data from the database format
          const scheduleData = latestSchedule.data?.scheduleData || {};
          const savedColors = latestSchedule.data?.activityColors || {};
          
          console.log('Schedule data from DB:', scheduleData);
          console.log('Activity colors from DB:', savedColors);
          
          // Process the data for the chart with colors
          processScheduleData(scheduleData, savedColors);
        } else {
          console.log('No schedules found in database, checking localStorage');
          fallbackToLocalStorage();
        }
      } catch (error) {
        console.log('Database fetch failed:', error);
        console.log('Falling back to localStorage');
        fallbackToLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const fallbackToLocalStorage = () => {
      const localData = localStorage.getItem('weeklySchedule');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          console.log('Using localStorage data:', parsed);
          
          // Extract colors from localStorage data
          const localColors = {};
          Object.values(parsed).forEach(activity => {
            if (activity && activity.name && activity.color) {
              localColors[activity.name] = activity.color;
            }
          });
          
          console.log('Colors from localStorage:', localColors);
          processScheduleData(parsed, localColors);
        } catch (e) {
          console.error('Error parsing localStorage:', e);
          setChartData([]);
        }
      } else {
        console.log('No data in localStorage either');
        setChartData([]);
      }
    };

    fetchScheduleData();
    
    // Refresh every 5 seconds to get latest data
    const interval = setInterval(fetchScheduleData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Render chart whenever chartData changes
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (loading) {
      svg.append("text")
        .attr("x", 200)
        .attr("y", 100)
        .attr("text-anchor", "middle")
        .attr("fill", "#6B7280")
        .attr("font-size", "16px")
        .text("🔄 Loading schedule data...");
      return;
    }

    if (chartData.length === 0) {
      svg.append("text")
        .attr("x", 200)
        .attr("y", 100)
        .attr("text-anchor", "middle")
        .attr("fill", "#9CA3AF")
        .attr("font-size", "16px")
        .text("📊 Add activities to see your schedule analytics!");
      return;
    }

    // Chart dimensions
    const width = 400;
    const height = 200;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3.scaleBand()
      .domain(chartData.map(d => d.name))
      .range([0, chartWidth])
      .padding(0.2);

    const maxCount = d3.max(chartData, d => d.count) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([chartHeight, 0]);

    // Chart container
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create bars with stored colors
    chartGroup.selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.name))
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => chartHeight - yScale(d.count))
      .attr("fill", d => d.color || '#6B7280') // Use the stored color
      .attr("rx", 4)
      .attr("opacity", 0.8);

    // Add value labels
    chartGroup.selectAll(".label")
      .data(chartData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => xScale(d.name) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.count) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .text(d => d.count);

    // X axis
    chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("fill", "#6B7280");

    // Y axis
    chartGroup.append("g")
      .call(d3.axisLeft(yScale).ticks(Math.min(5, maxCount)))
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("fill", "#6B7280");

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#1F2937")
      .text("Activity Distribution");

    // Total count
    const totalSlots = chartData.reduce((sum, d) => sum + d.count, 0);
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#6B7280")
      .text(`Total scheduled slots: ${totalSlots}`);

  }, [chartData, loading]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Schedule Analytics</h3>
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          width="400"
          height="200"
          className="border border-gray-200 rounded-lg bg-gray-50"
        />
      </div>
      {/* Status info */}
      <div className="mt-2 text-xs text-gray-500">
        {loading ? 'Loading...' : `Data: ${chartData.length} activities`}
      </div>
    </div>
  );
};

export default TimeChart;