
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Updated to include our new strategy
const strategies = [
  { id: 'supertrend_adx_strategy', name: 'SuperTrend + ADX Strategy' },
  { id: 'dependency_free_strategy', name: 'Dependency Free Strategy' },
];

// --- Mock config for the new strategy ---
const strategyParamsConfig: Record<
  string,
  { name: string; defaultValue: number; min: number; max: number; step: number }[]
> = {
  supertrend_adx_strategy: [
    { name: 'supertrend_period', defaultValue: 12, min: 5, max: 20, step: 1 },
    { name: 'supertrend_multiplier', defaultValue: 3, min: 1, max: 5, step: 0.5 },
    { name: 'adx_period', defaultValue: 14, min: 7, max: 28, step: 1 },
    { name: 'adx_threshold', defaultValue: 25, min: 15, max: 40, step: 1 },
  ],
  dependency_free_strategy: [
    { name: 'Fast MA', defaultValue: 50, min: 10, max: 100, step: 1 },
    { name: 'Slow MA', defaultValue: 200, min: 100, max: 300, step: 1 },
  ],
};

interface BacktestResults {
  initial_capital: number;
  final_equity: number;
  total_return_pct: number;
  sharpe_ratio: number;
  max_drawdown: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate_pct: number;
  equity_curve: { [key: string]: number };
  trades: {
    asset: string;
    shares: number;
    price: number;
    date: string;
    direction: 'BUY' | 'SELL';
  }[];
}

export default function BacktestingClientPage() {
  const searchParams = useSearchParams();
  const strategyParam = searchParams.get('strategy');
  const [selectedStrategy, setSelectedStrategy] = useState(
    strategyParam || 'supertrend_adx_strategy'
  );
  // State to hold the parsed JSON results
  const [backtestResults, setBacktestResults] = useState<BacktestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const currentParams = strategyParamsConfig[selectedStrategy] || [];
  const [strategyParams, setStrategyParams] = useState<Record<string, number>>({});

  useEffect(() => {
    if (strategyParam) {
      setSelectedStrategy(strategyParam);
    }
  }, [strategyParam]);

  useEffect(() => {
    const initialParams = (strategyParamsConfig[selectedStrategy] || []).reduce(
      (acc, param) => {
        acc[param.name] = param.defaultValue;
        return acc;
      },
      {} as Record<string, number>
    );
    setStrategyParams(initialParams);
  }, [selectedStrategy]);

  const getStrategyName = (id: string) => {
    return strategies.find(s => s.id === id)?.name || id;
  };

  const handleParamChange = (paramName: string, value: number[]) => {
    setStrategyParams(prev => ({ ...prev, [paramName]: value[0] }));
  };

  // --- Updated to fetch local mock data ---
  const runBacktest = async () => {
    setIsRunning(true);
    setBacktestResults(null);
    try {
      // Fetch data from the public folder
      const response = await fetch('/mock_backtest_results.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: BacktestResults = await response.json();
      // Add a small delay to simulate loading
      setTimeout(() => {
        setBacktestResults(data);
        setIsRunning(false);
      }, 1000);
    } catch (error: any) {
      console.error('Failed to run backtest:', error);
      setIsRunning(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  const equityCurveData = backtestResults?.equity_curve
    ? Object.entries(backtestResults.equity_curve).map(([date, value]) => ({
        date,
        value,
      }))
    : [];

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Backtest Configuration</CardTitle>
            <CardDescription>
              Set up the parameters for your backtest.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-base font-semibold">General</AccordionTrigger>
                <AccordionContent className="grid gap-6 pt-4">
                  <div className="grid gap-3">
                    <Label htmlFor="ticker">Ticker</Label>
                    <Input id="ticker" type="text" defaultValue="SPY" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="strategy">Strategy</Label>
                    <Select
                      value={selectedStrategy}
                      onValueChange={setSelectedStrategy}
                    >
                      <SelectTrigger id="strategy">
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        {strategies.map(strategy => (
                          <SelectItem key={strategy.id} value={strategy.id}>
                            {strategy.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        defaultValue="2023-01-01"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        defaultValue="2024-01-01"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="capital">Initial Capital</Label>
                    <Input id="capital" type="number" defaultValue="100000" />
                  </div>
                </AccordionContent>
              </AccordionItem>
              {currentParams.length > 0 && (
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-base font-semibold">Strategy Parameters</AccordionTrigger>
                  <AccordionContent className="grid gap-6 pt-4">
                    {currentParams.map(param => (
                      <div key={param.name} className="grid gap-3">
                        <div className="flex justify-between">
                          <Label htmlFor={param.name} className="capitalize">{param.name.replace(/_/g, ' ')}</Label>
                           <span className="text-muted-foreground text-sm">{strategyParams[param.name]}</span>
                        </div>
                        <Slider
                          id={param.name}
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={[strategyParams[param.name] || param.defaultValue]}
                          onValueChange={(value) => handleParamChange(param.name, value)}
                        />
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button className="w-full" onClick={runBacktest} disabled={isRunning}>
              {isRunning ? 'Running...' : 'Run Backtest'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <Tabs defaultValue="summary">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="chart">Performance Chart</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="summary">
            {isRunning ? (
              <Card className="text-center p-8"><p>Running backtest, please wait...</p></Card>
            ) : !backtestResults ? (
              <Card className="text-center p-8"><p>Click "Run Backtest" to see the results.</p></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                <Card>
                  <CardHeader><CardTitle>Total Return</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-green-500">{backtestResults.total_return_pct}%</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Final Equity</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{formatCurrency(backtestResults.final_equity)}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Sharpe Ratio</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{backtestResults.sharpe_ratio}</p></CardContent>
                </Card>
                 <Card>
                  <CardHeader><CardTitle>Max Drawdown</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-red-500">{(backtestResults.max_drawdown * 100).toFixed(2)}%</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Win Rate</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{backtestResults.win_rate_pct}%</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Total Trades</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{backtestResults.total_trades}</p></CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>Equity Curve</CardTitle>
                <CardDescription>Portfolio value over time.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] w-full">
                 {isRunning ? (
                    <div className="flex items-center justify-center h-full"><p>Loading chart...</p></div>
                  ) : !backtestResults ? (
                    <div className="flex items-center justify-center h-full"><p>Run a backtest to generate the chart.</p></div>
                  ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityCurveData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`}/>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#333', border: 'none' }}
                        labelStyle={{ color: '#fff' }}
                        itemStyle={{ color: '#8884d8' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>Detailed log of all trades executed during the backtest.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isRunning ? (
                       <TableRow><TableCell colSpan={5} className="text-center">Loading trades...</TableCell></TableRow>
                    ) : !backtestResults || backtestResults.trades.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center">No trades executed.</TableCell></TableRow>
                    ) : (
                      backtestResults.trades.map((trade, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(trade.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={trade.direction === 'BUY' ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}
                            >
                              {trade.direction}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(trade.price)}</TableCell>
                          <TableCell>{trade.shares}</TableCell>
                          <TableCell>{formatCurrency(trade.price * trade.shares)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
