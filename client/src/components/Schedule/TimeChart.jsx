import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useSchedule } from '../../hooks/useSchedule';

const TimeChart = () => {
  const svgRef = useRef();
  const { getScheduleData } = useSchedule();

  useEffect(() => {
    const data = getScheduleData();
    const svg = d3.select(svgRef.current);
    
    // Clear previous chart
    svg.selectAll("*").remove();
    
    if (data.activities.length === 0) {
      svg.append("text")
        .attr("x", 200)
        .attr("y", 100)
        .attr("text-anchor", "middle")
        .text("No activities scheduled yet");
      return;
    }

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(data.activities.map(d => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data.activities, d => d.count)])
      .range([height - margin.bottom, margin.top]);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(data.activities.map(d => d.name))
      .range(['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6366F1']);

    // Create bars
    svg.selectAll('.bar')
      .data(data.activities)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.name))
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d.count))
      .attr('fill', d => colorScale(d.name))
      .attr('opacity', 0.8);

    // Add value labels on bars
    svg.selectAll('.label')
      .data(data.activities)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.count)
      .attr('font-size', '12px')
      .attr('fill', '#374151');

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('font-size', '10px');

    // Add y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '10px');

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Activity Distribution');

  }, [getScheduleData]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Schedule Analytics</h3>
      <svg
        ref={svgRef}
        width="400"
        height="200"
        className="border border-gray-200 rounded"
      ></svg>
    </div>
  );
};

export default TimeChart;