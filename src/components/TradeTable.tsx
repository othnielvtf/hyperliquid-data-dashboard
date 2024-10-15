import React, { useState } from 'react';
import { Trade } from '../types';
import { format } from 'date-fns';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
}

type SortKey = keyof Trade;
type SortOrder = 'asc' | 'desc';

const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  const [sortKey, setSortKey] = useState<SortKey>('time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedTrades = [...trades].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (column !== sortKey) return null;
    return sortOrder === 'asc' ? <ArrowUp className="inline w-4 h-4 ml-1" /> : <ArrowDown className="inline w-4 h-4 ml-1" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('time')}>
              Time <SortIcon column="time" />
            </th>
            <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('coin')}>
              Coin <SortIcon column="coin" />
            </th>
            <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('dir')}>
              Direction <SortIcon column="dir" />
            </th>
            <th className="py-3 px-6 text-right cursor-pointer" onClick={() => handleSort('px')}>
              Price <SortIcon column="px" />
            </th>
            <th className="py-3 px-6 text-right cursor-pointer" onClick={() => handleSort('sz')}>
              Size <SortIcon column="sz" />
            </th>
            <th className="py-3 px-6 text-right cursor-pointer" onClick={() => handleSort('ntl')}>
              Notional <SortIcon column="ntl" />
            </th>
            <th className="py-3 px-6 text-right cursor-pointer" onClick={() => handleSort('fee')}>
              Fee <SortIcon column="fee" />
            </th>
            <th className="py-3 px-6 text-right cursor-pointer" onClick={() => handleSort('closedPnl')}>
              Closed PnL <SortIcon column="closedPnl" />
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {sortedTrades.map((trade, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left whitespace-nowrap">
                {format(trade.time, 'yyyy-MM-dd HH:mm:ss')}
              </td>
              <td className="py-3 px-6 text-left">{trade.coin}</td>
              <td className="py-3 px-6 text-left">{trade.dir}</td>
              <td className="py-3 px-6 text-right">{trade.px.toFixed(2)}</td>
              <td className="py-3 px-6 text-right">{trade.sz.toFixed(4)}</td>
              <td className="py-3 px-6 text-right">{trade.ntl.toFixed(2)}</td>
              <td className="py-3 px-6 text-right">{trade.fee.toFixed(6)}</td>
              <td className="py-3 px-6 text-right">{trade.closedPnl.toFixed(6)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeTable;