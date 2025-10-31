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
import { CandlestickChart } from '@/components/candlestick-chart';

const API_URL = 'https://runbacktest-pppxu6mrya-uc.a.run.app';

interface Step {
  step: number;
  name: string;
  status: 'in-progress' | 'success' | 'error';
  message?: string;
}

const STEPS = [
  'Validating Parameters',
  'Fetching Market Data',
  'Running Backtest',
  'Presenting Results',
];

export default function ForwardTestingPage() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [finalResults, setFinalResults] = useState<any>(null);
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
              if (existingStep) {
                return prevSteps.map((s) =>
                  s.step === parsed.step ? { ...s, ...parsed } : s
                );
              } else {
                return [...prevSteps, parsed];
              }
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
            {currentStep
              ? `${currentStep.name} - ${currentStep.status}`
              : 'Starting backtest...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {STEPS.map((name, index) => {
                const stepData = steps.find((s) => s.step === index);
                const status = stepData?.status || 'pending';
                return (
                  <div key={name} className="flex items-center space-x-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${{
                        pending: 'bg-gray-400',
                        'in-progress': 'bg-blue-500 animate-spin',
                        success: 'bg-green-500',
                        error: 'bg-red-500',
                      }[status]}`}>
                      {status === 'success' ? '✓' : ''}
                    </span>
                    <span className="text-gray-500">{name}</span>
                  </div>
                );
              })}
            </div>
            {error && <p className="text-red-500">Error: {error}</p>}
          </div>
        </CardContent>
      </Card>

      {finalResults && (
        <Card>
          <CardHeader>
            <CardTitle>Backtest Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-500">Ending Equity</p>
                <p className="text-2xl font-bold">
                  ${finalResults.stats['Ending Equity']?.toLocaleString()}
                </p>
              </div>
              {/* Add other stat cards here */}
            </div>
            <CandlestickChart 
                data={finalResults.trades} 
                height={400} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
