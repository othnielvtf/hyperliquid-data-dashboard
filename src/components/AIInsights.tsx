import React, { useState } from 'react';
import axios from 'axios';

interface AIInsightsProps {
  trades: any[]; // Replace 'any' with your Trade type
  worstTradingPair: string;
  bestTradingPair: string;
  highestProfit: number;
}

const AIInsights: React.FC<AIInsightsProps> = ({ trades, worstTradingPair, bestTradingPair, highestProfit }) => {
  const [apiKey, setApiKey] = useState('');
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateInsights = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `Analyze these trading statistics and provide insights:
                Total trades: ${trades.length}
                Worst trading pair: ${worstTradingPair}
                Best trading pair: ${bestTradingPair}
                Highest profit: $${highestProfit.toFixed(2)}
                
                Please provide a summary of the trading performance, including what to improve, 
                what to maintain, and an overall sentiment (positive or negative).`
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      setInsights(response.data.choices[0].message.content);
    } catch (err) {
      setError('Failed to generate insights. Please check your API key and try again.');
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-2">AI-Generated Insights</h3>
      <div className="mb-4">
        <label htmlFor="api-key" className="block mb-1">OpenAI API Key:</label>
        <input
          type="password"
          id="api-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Enter your OpenAI API key"
        />
      </div>
      <button
        onClick={generateInsights}
        disabled={loading || !apiKey}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {loading ? 'Generating...' : 'Generate Insights'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {insights && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">AI Insights:</h4>
          <p className="whitespace-pre-wrap">{insights}</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;