import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Trade } from '../types';

interface AllocationPieChartProps {
  trades: Trade[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AllocationPieChart: React.FC<AllocationPieChartProps> = ({ trades }) => {
  const allocationData = trades.reduce((acc, trade) => {
    acc[trade.coin] = (acc[trade.coin] || 0) + Math.abs(trade.ntl);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(allocationData).map(([coin, value]) => ({
    name: coin,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AllocationPieChart;