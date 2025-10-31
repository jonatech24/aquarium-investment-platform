'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import {
  CandlestickChart,
  type OHLCData,
  type TradeData,
} from '@/components/candlestick-chart';

// --- Type Definitions ---
const API_URL = 'https://runbacktest-pppxu6mrya-uc.a.run.app';

interface Step {
  step: number;
  name: string;
  status: 'in-progress' | 'success' | 'error';
  message?: string;
}

interface BacktestStats {
  [key: string]: number | string | undefined;
  'Ending Equity'?: number;
  'Total Return (%)'?: number;
  'Sharpe Ratio'?: number;
  'Max Drawdown (%)'?: number;
  'Win Rate (%)'?: number;
}

// This defines the structure of the entire results object
interface BacktestResults {
  stats: BacktestStats;
  trades: TradeData[];
  ohlc: OHLCData[];
  // Add any other fields that might come from the API
}

const STEPS = [
  'Validating Parameters',
  'Fetching Market Data',
  'Running Backtest',
  'Presenting Results',
];

// --- Helper Functions ---
const StatCard = ({ label, value, isPercentage = false }: { label: string, value?: number | string, isPercentage?: boolean }) => (
  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-2xl font-bold">
      {typeof value === 'number'
        ? `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${isPercentage ? '%' : ''}`
        : 'N/A'}
    </p>
  </div>
);

// --- Main Component ---
export default function ForwardTestingPage() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [finalResults, setFinalResults] = useState<BacktestResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBacktest = async () => {
    setIsRunning(true);
    setSteps([]);
    setFinalResults(null);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategy: 'trend_following', // Hardcoded for this example
          ticker: 'BTC-USD',
          startDate: '2023-01-01',
          endDate: '2024-01-01',
          timeframe: '1d',
          cash: 100000,
          params: {
            sma_fast: 10,
            sma_slow: 30,
          },
        }),
      });

      if (!response.body) {
        throw new Error('Response body is null.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          try {
            const parsed = JSON.parse(line);

            if (parsed.status === 'error') {
              throw new Error(parsed.message);
            }

            setSteps((prevSteps) => {
              const existingStep = prevSteps.find((s) => s.step === parsed.step);
              return existingStep
                ? prevSteps.map((s) => (s.step === parsed.step ? { ...s, ...parsed } : s))
                : [...prevSteps, parsed];
            });

            if (parsed.results) {
              setFinalResults(parsed.results);
            }
          } catch (e: any) {
            console.error('Failed to parse stream chunk:', line, e);
            setError(`An error occurred while processing the results: ${e.message}`);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to run backtest:', error);
      setError(error.message || 'An unknown error occurred.');
    }
    setIsRunning(false);
  };

  useEffect(() => {
    runBacktest();
  }, []);

  const currentStep = steps[steps.length - 1];
  const progress = finalResults ? 100 : (steps.length / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">Backtest Demo</h1>
        <Button onClick={runBacktest} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Rerun Backtest'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backtest Progress</CardTitle>
          <CardDescription>
            {isRunning
              ? `${currentStep?.name ?? 'Starting...'} - ${currentStep?.status ?? ''}`
              : finalResults
              ? 'Backtest complete.'
              : 'Ready to start.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} />
            {error && <p className="text-red-500">Error: {error}</p>}
          </div>
        </CardContent>
      </Card>

      {finalResults && (
        <Card>
          <CardHeader>
            <CardTitle>Backtest Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Ending Equity" value={finalResults.stats['Ending Equity']} />
                <StatCard label="Total Return" value={finalResults.stats['Total Return (%)']} isPercentage />
                <StatCard label="Sharpe Ratio" value={finalResults.stats['Sharpe Ratio']} />
                <StatCard label="Max Drawdown" value={finalResults.stats['Max Drawdown (%)']} isPercentage/>
                <StatCard label="Win Rate" value={finalResults.stats['Win Rate (%)']} isPercentage/>
            </div>
            <CandlestickChart
              ohlcData={finalResults.ohlc}
              tradeData={finalResults.trades}
              height={500}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
