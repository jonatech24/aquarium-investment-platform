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
import { useEffect, useState, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


// --- CONFIGURATION ---
const BACKEND_URL = 'https://aquarium-investment-platform-studio-2799607830-e7b65.us-east4.hosted.app';

const strategies = [
    { id: 'trend_following', name: 'Trend Following', active: true },
    { id: 'dependency_free_strategy', name: 'Dependency Free Strategy', active: true },
    { id: 'twap', name: 'TWAP', active: false },
    { id: 'bullflag', name: 'Bull Flag Momentum', active: false },
    { id: 'matrendtrading', name: 'Moving Average Trend', active: false },
    { id: 'openingrangebreakout', name: 'Opening Range Breakout', active: false },
    { id: 'gapandgo', name: 'Gap and Go', active: false },
    { id: 'meanreversion', name: 'Mean Reversion', active: false },
    { id: 'momentum', name: 'Momentum Trading', active: false },
    { id: 'vwap', name: 'VWAP', active: false },
    { id: 'pov', name: 'POV', active: false },
    { id: 'eventdriven', name: 'Event-Driven', active: false },
    { id: 'scalping', name: 'Scalping', active: false },
    { id: 'abcdpattern', name: 'ABCD Pattern', active: false },
    { id: 'arbitrage', name: 'Arbitrage', active: false },
    { id: 'statisticalarbitrage', name: 'Statistical Arbitrage', active: false },
    { id: 'marketmaking', name: 'Market Making', active: false },
    { id: 'implementationshortfall', name: 'Implementation Shortfall', active: false },
    { id: 'hft', name: 'HFT', active: false },
    { id: 'machinelearning', name: 'Machine Learning', active: false },
    { id: 'reversaltrading', name: 'Reversal Trading', active: false },
  ];

const strategyParamsConfig: Record<
  string,
  { name: string; defaultValue: number; min: number; max: number; step: number }[]
> = {
  trend_following: [
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

// --- TYPE DEFINITIONS ---
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
  asset_long_name?: string; // Optional: To display the full name of the asset
}

interface BacktestError {
  error: string;
}

// --- COMPONENT ---
export default function BacktestingClientPage() {
  // --- STATE MANAGEMENT ---
  const searchParams = useSearchParams();
  const strategyParam = searchParams.get('strategy');

  // Configuration States
  const [selectedStrategy, setSelectedStrategy] = useState(strategyParam || 'trend_following');
  const [dataSource, setDataSource] = useState('yahoo');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [strategyParams, setStrategyParams] = useState<Record<string, number>>({});
  const [startDate, setStartDate] = useState<Date | undefined>(new Date('2023-01-01'));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date('2024-01-01'));


  // Input Refs for direct value access
  const capitalRef = useRef<HTMLInputElement>(null);
  const tickerRef = useRef<HTMLInputElement>(null);

  // Result and Status States
  const [backtestResults, setBacktestResults] = useState<BacktestResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // --- EFFECTS ---
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

  // --- HANDLERS ---
  const handleParamChange = (paramName: string, value: number[]) => {
    setStrategyParams(prev => ({ ...prev, [paramName]: value[0] }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setCsvFile(event.target.files[0]);
      setError(null); // Clear error on new file selection
    }
  };

  const runBacktest = async () => {
    setIsRunning(true);
    setBacktestResults(null);
    setError(null);

    const formData = new FormData();

    // Append general settings
    formData.append('strategy', selectedStrategy);
    formData.append('capital', capitalRef.current?.value || '100000');
    formData.append('dataSource', dataSource);

    // Append data source specific settings
    if (dataSource === 'csv') {
      if (!csvFile) {
        setError('Please select a CSV file to upload.');
        setIsRunning(false);
        return;
      }
      formData.append('csv_file', csvFile);
    } else {
      const ticker = tickerRef.current?.value || 'SPY';
      formData.append('ticker', ticker);
      if (startDate) {
        formData.append('startDate', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
        formData.append('endDate', format(endDate, 'yyyy-MM-dd'));
      }
    }

    // Append strategy parameters
    for (const [key, value] of Object.entries(strategyParams)) {
      formData.append(`param_${key}`, value.toString());
    }

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData, // FormData is sent as multipart/form-data
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as BacktestError).error || 'An unknown error occurred.');
      }
      
      const finalResult = result as BacktestResults;
      if (!finalResult.asset_long_name && dataSource === 'yahoo') {
          finalResult.asset_long_name = tickerRef.current?.value || 'SPY';
      }

      setBacktestResults(finalResult);
    } catch (e: any) {
      console.error('Failed to run backtest:', e);
      setError(e.message || 'An unexpected error occurred. Check the console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  // --- UTILITY FUNCTIONS ---
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const equityCurveData = backtestResults?.equity_curve
    ? Object.entries(backtestResults.equity_curve).map(([date, value]) => ({ date, value }))
    : [];
    
  const currentParams = strategyParamsConfig[selectedStrategy] || [];


  // --- RENDER ---
  return (
    <>
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-5 xl:grid-cols-5">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Backtest Configuration</CardTitle>
            <CardDescription>
              Configure your data source, strategy, and parameters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-base font-semibold">General</AccordionTrigger>
                <AccordionContent className="grid gap-6 pt-4">
                  <div className="grid gap-3">
                    <Label htmlFor="strategy">Strategy</Label>
                    <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                      <SelectTrigger id="strategy"><SelectValue placeholder="Select strategy" /></SelectTrigger>
                      <SelectContent>
                        {strategies.map(strategy => (
                          <SelectItem key={strategy.id} value={strategy.id} disabled={!strategy.active}>
                            {strategy.name} {!strategy.active && '(Coming Soon)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="capital">Initial Capital</Label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                       <Input id="capital" type="number" defaultValue={100000} ref={capitalRef} className="pl-7"/>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-base font-semibold">Data Source</AccordionTrigger>
                <AccordionContent className="grid gap-6 pt-4">
                  <RadioGroup value={dataSource} onValueChange={setDataSource} className="grid grid-cols-3 gap-2">
                    <Label htmlFor="r1" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                      <RadioGroupItem value="yahoo" id="r1" className="sr-only" />Yahoo
                    </Label>
                    <Label htmlFor="r2" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                      <RadioGroupItem value="polygon" id="r2" className="sr-only" />Polygon
                    </Label>
                    <Label htmlFor="r3" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                      <RadioGroupItem value="csv" id="r3" className="sr-only" />CSV
                    </Label>
                  </RadioGroup>
                  {(dataSource === 'yahoo' || dataSource === 'polygon') && (
                    <div className="grid gap-4 pt-4">
                      <div className="grid gap-3">
                        <Label htmlFor="ticker">Ticker</Label>
                        <Input id="ticker" type="text" defaultValue="SPY" ref={tickerRef}/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="start-date">Start Date</Label>
                           <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="end-date">End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !endDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  )}
                  {dataSource === 'csv' && (
                    <div className="grid gap-3 pt-4">
                      <Label htmlFor="csv-file">Upload CSV File</Label>
                      <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {currentParams.length > 0 && (
                <AccordionItem value="item-3">
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
         {error && (
             <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Backtest Failed</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
          )}
        <Tabs defaultValue="summary">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="chart">Performance Chart</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
            </TabsList>
            {backtestResults && (
                 <div className="text-sm text-muted-foreground">
                    {backtestResults.asset_long_name ? (
                        <span>{backtestResults.asset_long_name}</span>
                    ) : null}
                </div>
            )}
          </div>
          <TabsContent value="summary">
            {isRunning ? (
              <Card className="text-center p-8"><p>Running backtest, please wait...</p></Card>
            ) : !backtestResults ? (
               <Card className="text-center p-8"><p>Configure and run a backtest to see results.</p></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                 <Card>
                  <CardHeader><CardTitle>Total Return</CardTitle></CardHeader>
                  <CardContent><p className={`text-2xl font-bold ${backtestResults.total_return_pct >= 0 ? 'text-green-500' : 'text-red-500'}`}>{backtestResults.total_return_pct.toFixed(2)}%</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Final Equity</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{formatCurrency(backtestResults.final_equity)}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Sharpe Ratio</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{backtestResults.sharpe_ratio.toFixed(2)}</p></CardContent>
                </Card>
                 <Card>
                  <CardHeader><CardTitle>Max Drawdown</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-red-500">{(backtestResults.max_drawdown * 100).toFixed(2)}%</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Win Rate</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{backtestResults.win_rate_pct.toFixed(2)}%</p></CardContent>
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
    </>
  );
}
