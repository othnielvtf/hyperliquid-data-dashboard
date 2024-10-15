import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Trade } from '../types';

interface PortfolioAllocationChartProps {
  trades: Trade[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const PortfolioAllocationChart: React.FC<PortfolioAllocationChartProps> = ({ trades }) => {
  const portfolioAllocation = trades.reduce((acc, trade) => {
    acc[trade.coin] = {
      notional: (acc[trade.coin]?.notional || 0) + Math.abs(trade.ntl),
      pnl: (acc[trade.coin]?.pnl || 0) + trade.closedPnl,
    };
    return acc;
  }, {} as Record<string, { notional: number; pnl: number }>);

  const totalValue = Object.values(portfolioAllocation).reduce((sum, value) => sum + value.notional, 0);

  const chartData = Object.entries(portfolioAllocation)
    .map(([coin, { notional, pnl }]) => ({
      name: coin,
      value: (notional / totalValue) * 100,
      pnl,
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow">
          <p className="font-semibold">{`${payload[0].name}: ${payload[0].value.toFixed(2)}%`}</p>
          <p className="text-sm">{`PNL: ${payload[0].payload.pnl.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

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
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PortfolioAllocationChart;