import React, { useState, useMemo } from 'react';
import { Trade } from '../types';
import { format, startOfWeek, endOfWeek, addWeeks, isAfter, addDays, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import AIInsights from './AIInsights';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface InsightsCardsProps {
  trades: Trade[];
}

const InsightsCards: React.FC<InsightsCardsProps> = ({ trades }) => {
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const tradeDate = trade.time;
      return (!startDate || tradeDate >= parseISO(startDate)) &&
             (!endDate || tradeDate <= parseISO(endDate));
    });
  }, [trades, startDate, endDate]);

  const adjustedTrades = useMemo(() => {
    return filteredTrades.map(trade => ({
      ...trade,
      time: toZonedTime(trade.time, selectedTimezone)
    }));
  }, [filteredTrades, selectedTimezone]);

  const cumulativePNL = adjustedTrades.reduce((sum, trade) => sum + trade.closedPnl, 0);
  const averagePNL = cumulativePNL / trades.length;
  
  const sortedTrades = [...trades].sort((a, b) => b.closedPnl - a.closedPnl);
  const bestTrade = sortedTrades[0];
  const worstTrade = sortedTrades[sortedTrades.length - 1];

  const weeklyTrades = trades.reduce((acc, trade) => {
    const weekStart = startOfWeek(trade.time, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    acc[weekKey] = (acc[weekKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxTradesPerWeek = Math.max(...Object.values(weeklyTrades));
  const averageTradesPerWeek = trades.length / Object.keys(weeklyTrades).length;

  const winningTrades = trades.filter(trade => trade.closedPnl > 0).length;
  const losingTrades = trades.filter(trade => trade.closedPnl < 0).length;
  const winLoseRatio = winningTrades / (losingTrades || 1); // Avoid division by zero

  // Calculate Best Week
  const weeklyPNL = trades.reduce((acc, trade) => {
    const weekStart = startOfWeek(trade.time, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    acc[weekKey] = (acc[weekKey] || 0) + trade.closedPnl;
    return acc;
  }, {} as Record<string, number>);

  const bestWeek = Object.entries(weeklyPNL).reduce((best, [date, pnl]) => {
    return pnl > best.pnl ? { date, pnl } : best;
  }, { date: '', pnl: -Infinity });

  const bestWeekStart = new Date(bestWeek.date);
  const bestWeekEnd = endOfWeek(bestWeekStart, { weekStartsOn: 1 });

  // Calculate Best Month
  const monthlyPNL = trades.reduce((acc, trade) => {
    const monthKey = format(trade.time, 'yyyy-MM');
    acc[monthKey] = (acc[monthKey] || 0) + trade.closedPnl;
    return acc;
  }, {} as Record<string, number>);

  const bestMonth = Object.entries(monthlyPNL).reduce((best, [date, pnl]) => {
    return pnl > best.pnl ? { date, pnl } : best;
  }, { date: '', pnl: -Infinity });

  const bestMonthDate = new Date(bestMonth.date);

  // Calculate Total Gain and Total Loss
  const totalGain = trades.reduce((sum, trade) => sum + (trade.closedPnl > 0 ? trade.closedPnl : 0), 0);
  const totalLoss = trades.reduce((sum, trade) => sum + (trade.closedPnl < 0 ? trade.closedPnl : 0), 0);


  // Calculate the week with the maximum number of trades
  const maxTradesWeek = Object.entries(weeklyTrades).reduce((max, [week, trades]) => {
    return trades > max.trades ? { week, trades } : max;
  }, { week: '', trades: 0 });

  // Format the start and end dates of the week
  const maxTradesWeekStart = new Date(maxTradesWeek.week);
  const maxTradesWeekEnd = endOfWeek(maxTradesWeekStart, { weekStartsOn: 1 });
  // Calculate the week with the minimum number of trades
  const minTradesWeek = Object.entries(weeklyTrades).reduce((min, [week, trades]) => {
    return trades < min.trades ? { week, trades } : min;
  }, { week: '', trades: Infinity });

  // Format the start and end dates of the week
  const minTradesWeekStart = new Date(minTradesWeek.week);
  const minTradesWeekEnd = endOfWeek(minTradesWeekStart, { weekStartsOn: 1 });

  // Calculate Win Sharpe Ratio
  const winSharpeRatio = (averagePNL / (totalGain - totalLoss)) * Math.sqrt(trades.length);
  
   // Calculate PNL for each week
  const weeklyPNLs = trades.reduce((acc, trade) => {
    const weekStart = startOfWeek(trade.time, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    acc[weekKey] = (acc[weekKey] || 0) + trade.closedPnl;
    return acc;
  }, {} as Record<string, number>);

  // Sort weeks chronologically
  const sortedWeeks = Object.keys(weeklyPNLs).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Get the start and end dates of the trading period
  const firstWeekStart = new Date(sortedWeeks[0]);
  const lastWeekStart = new Date(sortedWeeks[sortedWeeks.length - 1]);

  // Generate all weeks in the period, including weeks with no trades
  const allWeeks: { start: Date; pnl: number }[] = [];
  let currentWeek = firstWeekStart;
  while (!isAfter(currentWeek, lastWeekStart)) {
    const weekKey = format(currentWeek, 'yyyy-MM-dd');
    allWeeks.push({
      start: currentWeek,
      pnl: weeklyPNLs[weekKey] || 0,
    });
    currentWeek = addWeeks(currentWeek, 1);
  }

  // Calculate worst and best trading pairs
  const pairPerformance = adjustedTrades.reduce((acc, trade) => {
    acc[trade.coin] = (acc[trade.coin] || 0) + trade.closedPnl;
    return acc;
  }, {} as Record<string, number>);

  const worstTradingPair = Object.entries(pairPerformance).reduce((worst, [pair, pnl]) => 
    pnl < worst.pnl ? { pair, pnl } : worst, { pair: '', pnl: Infinity }
  ).pair;

  const bestTradingPair = Object.entries(pairPerformance).reduce((best, [pair, pnl]) => 
    pnl > best.pnl ? { pair, pnl } : best, { pair: '', pnl: -Infinity }
  ).pair;

  // Prepare data for the chart
  const chartData = {
    labels: allWeeks.map(week => format(week.start, 'MMM d, yyyy')),
    datasets: [
      {
        label: 'Weekly PNL',
        data: allWeeks.map(week => week.pnl),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // This allows us to set a custom height
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly PNL Chart',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleTimezoneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimezone(event.target.value);
  };

  // Calculate PNL for each day
  const dailyPNLs = adjustedTrades.reduce((acc, trade) => {
    const dayKey = format(trade.time, 'yyyy-MM-dd');
    acc[dayKey] = (acc[dayKey] || 0) + trade.closedPnl;
    return acc;
  }, {} as Record<string, number>);

  // Sort days chronologically
  const sortedDays = Object.keys(dailyPNLs).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Get the start and end dates of the trading period
  const firstDay = new Date(sortedDays[0]);
  const lastDay = new Date(sortedDays[sortedDays.length - 1]);

  // Generate all days in the period, including days with no trades
  const allDays: { date: Date; pnl: number }[] = [];
  let currentDay = firstDay;
  while (!isAfter(currentDay, lastDay)) {
    const dayKey = format(currentDay, 'yyyy-MM-dd');
    allDays.push({
      date: currentDay,
      pnl: dailyPNLs[dayKey] || 0,
    });
    currentDay = addDays(currentDay, 1);
  }

  // Prepare data for the daily chart
  const dailyChartData = {
    labels: allDays.map(day => format(day.date, 'MMM d, yyyy')),
    datasets: [
      {
        label: 'Daily PNL',
        data: allDays.map(day => day.pnl),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const dailyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily PNL Chart',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = event.target.value;
    try {
      // Attempt to parse the date
      parseISO(newStartDate);
      setStartDate(newStartDate);
    } catch (error) {
      alert('Invalid start date. Please select a valid date.');
      // Reset the input value to the previous valid date
      event.target.value = startDate;
    }
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = event.target.value;
    try {
      // Attempt to parse the date
      parseISO(newEndDate);
      setEndDate(newEndDate);
    } catch (error) {
      alert('Invalid end date. Please select a valid date.');
      // Reset the input value to the previous valid date
      event.target.value = endDate;
    }
  };

    // Calculate Total Fees
    const totalFees = trades.reduce((sum, trade) => sum + trade.fee, 0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Cumulative PNL</h3>
        <p className="text-2xl font-bold">{cumulativePNL.toFixed(2)}</p>
        <p className="text-sm text-gray-500">Total Gain: {totalGain.toFixed(2)} <br></br>Total Loss: {totalLoss.toFixed(2)}</p>

      </div>
      <div className="bg-white p-6  shadow-md">
        <h3 className="text-lg font-semibold mb-2">Average PNL per Trade</h3>
        <p className="text-2xl font-bold">{averagePNL.toFixed(2)}</p>
      </div>
      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Best Trade</h3>
        <p className="text-2xl font-bold">{bestTrade.closedPnl.toFixed(2)}</p>
        <p className="text-sm text-gray-500">
          Coin: {bestTrade.coin} <br></br>Date: {format(bestTrade.time, 'dd-MM-yyyy')}
        </p>
      </div>
      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Worst Trade</h3>
        <p className="text-2xl font-bold">{worstTrade.closedPnl.toFixed(2)}</p>
        <p className="text-sm text-gray-500">
          Coin: {worstTrade.coin} <br></br>Date: {format(worstTrade.time, 'dd-MM-yyyy')}
        </p>
      </div>
      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Max & Min Trades per Week</h3>
        <p className="text-2xl font-bold">{maxTradesPerWeek} / {minTradesWeek.trades}</p>
        <p className="text-sm text-gray-500">
            {format(maxTradesWeekStart, 'd/M/yyyy')} - {format(maxTradesWeekEnd, 'd/M/yyyy')} <br></br>
            {format(minTradesWeekStart, 'd/M/yyyy')} - {format(minTradesWeekEnd, 'd/M/yyyy')}
        </p>
      </div>
      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Average Trades per Week</h3>
        <p className="text-2xl font-bold">{averageTradesPerWeek.toFixed(2)}</p>
      </div>
      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Win/Lose Ratio</h3>
        <p className="text-2xl font-bold">{winLoseRatio.toFixed(2)}</p>
        <p className="text-2xl font-bold">{winSharpeRatio.toFixed(2)}</p>
        <p className="text-sm text-gray-500">
          Wins: {winningTrades}, Losses: {losingTrades}
        </p>
      </div>
      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Best Week (Mon-Sun)</h3>
        <p className="text-2xl font-bold">+{bestWeek.pnl.toFixed(2)}</p>
        <p className="text-sm text-gray-500">
          {format(bestWeekStart, 'd/M/yyyy')} - {format(bestWeekEnd, 'd/M/yyyy')}
        </p>
      </div>
      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Best Month</h3>
        <p className="text-2xl font-bold">+{bestMonth.pnl.toFixed(2)}</p>
        <p className="text-sm text-gray-500">
          {format(bestMonthDate, 'MMMM yyyy')}
        </p>
      </div>
    
      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Weekly PNL Chart ({selectedTimezone})</h3>
        <div style={{ height: '300px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Weekly PNL Table ({selectedTimezone})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Week</th>
                <th className="text-right">PNL</th>
              </tr>
            </thead>
            <tbody>
              {allWeeks.map(({ start, pnl }) => (
                <tr key={format(start, 'yyyy-MM-dd')}>
                  <td>{format(start, 'MMM d, yyyy')} - {format(endOfWeek(start, { weekStartsOn: 1 }), 'MMM d, yyyy')}</td>
                  <td className={`text-right ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Daily PNL Chart ({selectedTimezone})</h3>
        <div style={{ height: '300px' }}>
          <Line data={dailyChartData} options={dailyChartOptions} />
        </div>
      </div>
      <div className='bg-white p-6 shadow-md col-span-full flex'>
        <div className="mb-4 pr-4">
        <label htmlFor="timezone-select" className="mr-2">Select Timezone:</label>
            <select
              id="timezone-select"
              value={selectedTimezone}
              onChange={handleTimezoneChange}
              className="border p-1"
            >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Asia/Tokyo">Japan Time</option>
            <option value="Asia/Kuala_Lumpur">Kuala Lumpur Time</option>
          </select>
        </div>
        <div className='mb-4 pr-4'>
          <label htmlFor="start-date" className="mr-2">Start Date:</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={handleStartDateChange}
            className="border rounded p-1"
          />
        </div>
        <div className='mb-4 pr-4'>
          <label htmlFor="end-date" className="mr-2">End Date:</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={handleEndDateChange}
            className="border rounded p-1"
          />
        </div>
      </div>
      <div className="col-span-full">
        <AIInsights
          trades={adjustedTrades}
          worstTradingPair={worstTradingPair}
          bestTradingPair={bestTradingPair}
          highestProfit={bestTrade.closedPnl}
        />
      </div>

      <div className="bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Total Fees</h3>
        <p className="text-2xl font-bold">{totalFees.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default InsightsCards;