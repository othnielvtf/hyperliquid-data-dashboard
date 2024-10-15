import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trade } from '../types';
import { format } from 'date-fns';

interface PnLChartProps {
  trades: Trade[];
}

const PnLChart: React.FC<PnLChartProps> = ({ trades }) => {
  const chartData = trades.map(trade => ({
    time: format(trade.time, 'MM/dd HH:mm'),
    pnl: trade.closedPnl,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="pnl" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PnLChart;