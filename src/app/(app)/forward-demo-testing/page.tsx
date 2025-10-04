'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function ForwardTestingPage() {
  const [backtestOutput, setBacktestOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runBacktest = async () => {
    setIsRunning(true);
    setBacktestOutput('');
    try {
      const response = await fetch(`https://run-strategy-pppxu6mrya-uc.a.run.app?strategy_name=simple_strategy`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Network response was not ok');
      }
      const data = await response.text();
      setBacktestOutput(data);
    } catch (error: any) {
      console.error('Failed to run backtest:', error);
      setBacktestOutput(`<p>Failed to run backtest.</p><pre>${error.message}</pre>`);
    }
    setIsRunning(false);
  };

  useEffect(() => {
    runBacktest();
  }, []);

  const promoteToForwardTesting = () => {
    console.log('Promoting to forward testing');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Forward Testing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Backtest Results</CardTitle>
          <CardDescription>Results from the last backtest.</CardDescription>
        </CardHeader>
        <CardContent>
          {isRunning ? (
            <p>Running backtest...</p>
          ) : backtestOutput ? (
            <div dangerouslySetInnerHTML={{ __html: backtestOutput }} />
          ) : (
            <p>No backtest results found.</p>
          )}
        </CardContent>
      </Card>
      <Button onClick={promoteToForwardTesting}>Promote to Forward Testing</Button>
    </div>
  );
}
