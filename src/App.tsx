import React, { useState } from 'react';
import { parseCSV } from './utils/csvParser';
import { Trade } from './types';
import TradeTable from './components/TradeTable';
import InsightsCards from './components/InsightsCards';
import PortfolioAllocationChart from './components/PortfolioAllocationChart';
import CoinPNLBreakdown from './components/CoinPNLBreakdown';
import { Upload } from 'lucide-react';

function App() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          const parsedTrades = parseCSV(text);
          if (parsedTrades.length === 0) {
            setError('No valid trades found in the CSV file.');
          } else {
            setTrades(parsedTrades);
            setError(null);
          }
        } catch (err) {
          setError('Error parsing CSV file. Please check the file format.');
          console.error(err);
        }
      };
      reader.onerror = () => {
        setError('Error reading the file. Please try again.');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Trade Data Dashboard</h1>
        
        <div className="mb-8">
          <label htmlFor="csv-upload" className="flex items-center justify-center w-full p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <Upload className="w-6 h-6 mr-2 text-gray-500" />
            <span className="text-gray-500">Upload CSV file</span>
            <input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {trades.length > 0 && (
          <>
            <InsightsCards trades={trades} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Portfolio Allocation</h2>
                <PortfolioAllocationChart trades={trades} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <CoinPNLBreakdown trades={trades} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Trade Table</h2>
              <TradeTable trades={trades} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;