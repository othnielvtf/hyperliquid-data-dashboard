import React from 'react';
import { Trade } from '../types';

interface CoinPNLBreakdownProps {
  trades: Trade[];
}

const CoinPNLBreakdown: React.FC<CoinPNLBreakdownProps> = ({ trades }) => {
  const coinPNL = trades.reduce((acc, trade) => {
    acc[trade.coin] = (acc[trade.coin] || 0) + trade.closedPnl;
    return acc;
  }, {} as Record<string, number>);

  const sortedCoinPNL = Object.entries(coinPNL)
    .sort(([, a], [, b]) => b - a)
    .map(([coin, pnl]) => ({ coin, pnl }));

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Coin PNL Breakdown</h3>
      <ul className="space-y-2">
        {sortedCoinPNL.map((item, index) => (
          <li key={index} className="flex justify-between items-center">
            <span className="font-medium">{item.coin}</span>
            <span className={`font-bold ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {item.pnl.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoinPNLBreakdown;