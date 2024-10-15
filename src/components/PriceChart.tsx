import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trade } from '../types';
import { format } from 'date-fns';

interface PriceChartProps {
  trades: Trade[];
}

const PriceChart: React.FC<PriceChartProps> = ({ trades }) => {
  const chartData = trades.map(trade => ({
    time: format(trade.time, 'MM/dd HH:mm'),
    price: trade.px,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PriceChart;