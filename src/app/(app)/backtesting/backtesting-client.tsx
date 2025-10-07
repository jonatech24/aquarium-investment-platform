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
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, CalendarIcon, Info, Loader2, BarChart, ListOrdered, AlertCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


// --- CONFIGURATION ---
const BACKEND_URL = 'https://aquarium-investment-platform-studio-2799607830-e7b65.us-east4.hosted.app/';

const strategies = [
    { id: 'trend_following', name: 'Trend Following', active: true },
    { id: 'dependency_free_strategy', name: 'Dependency Free Strategy', active: true },
];

const strategyParamsConfig: Record<
  string,
  { name: string; defaultValue: number; min?: number; max?: number; step?: number, description: string }[]
> = {
  trend_following: [
    { name: 'supertrend_period', defaultValue: 12, min: 5, max: 20, step: 1, description: 'Period for Supertrend calculation.' },
    { name: 'supertrend_multiplier', defaultValue: 3, min: 1, max: 5, step: 0.5, description: 'Multiplier for ATR in Supertrend.' },
    { name: 'adx_period', defaultValue: 14, min: 7, max: 28, step: 1, description: 'Period for ADX calculation.' },
    { name: 'adx_threshold', defaultValue: 25, min: 15, max: 40, step: 1, description: 'ADX value above which a trend is considered strong.' },
  ],
  dependency_free_strategy: [
    { name: 'Fast MA', defaultValue: 50, min: 10, max: 100, step: 1, description: 'Period for the fast moving average.' },
    { name: 'Slow MA', defaultValue: 200, min: 100, max: 300, step: 1, description: 'Period for the slow moving average.' },
  ],
};

const timeframes = ['1d', '1h', '4h'];
const optimizationMetrics = [
  'SQN', 'Return [%]', 'Sharpe Ratio', 'Sortino Ratio', 'Calmar Ratio', 'Max. Drawdown [%]', 'Win Rate [%]'
];

// --- TYPE DEFINITIONS ---
interface BacktestError { error: string; }

// --- COMPONENT ---
export default function BacktestingClientPage() {
  const searchParams = useSearchParams();
  const strategyParam = searchParams.get('strategy');

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('single');
  
  // Config States
  const [selectedStrategy, setSelectedStrategy] = useState(strategyParam || 'trend_following');
  const [dataSource, setDataSource] = useState('yahoo');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date('2023-01-01'));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date('2024-01-01'));
  const [timeframe, setTimeframe] = useState('1d');

  // Simulation Config
  const [simulationConfig, setSimulationConfig] = useState({
    cash: 100000,
    commission: 0.001,
    margin: 1.0,
  });

  // Parameters State
  const [singleParams, setSingleParams] = useState<Record<string, number>>({});
  const [optimizationParams, setOptimizationParams] = useState<Record<string, { start: number; end: number; step: number }>>({});

  // Optimization Config
  const [optimizationConfig, setOptimizationConfig] = useState({
    maximize: 'SQN',
    method: 'grid',
    maxTries: 50,
  });

  // Refs
  const tickerRef = useRef<HTMLInputElement>(null);

  // Result and Status States
  const [backtestResults, setBacktestResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const currentStrategyParams = useMemo(() => strategyParamsConfig[selectedStrategy] || [], [selectedStrategy]);

  // --- EFFECTS ---
  useEffect(() => {
    if (strategyParam) setSelectedStrategy(strategyParam);
  }, [strategyParam]);

  useEffect(() => {
    const initialSingleParams: Record<string, number> = {};
    const initialOptParams: Record<string, { start: number; end: number; step: number }> = {};

    currentStrategyParams.forEach(param => {
      initialSingleParams[param.name] = param.defaultValue;
      initialOptParams[param.name] = { 
        start: param.min ?? param.defaultValue, 
        end: param.max ?? param.defaultValue, 
        step: param.step ?? 1 
      };
    });

    setSingleParams(initialSingleParams);
    setOptimizationParams(initialOptParams);
  }, [selectedStrategy, currentStrategyParams]);

  // --- HANDLERS ---
  const handleSimulationConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSimulationConfig(prev => ({ ...prev, [id]: parseFloat(value) }));
  };

  const handleSingleParamChange = (name: string, value: string) => {
    setSingleParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleOptimizationParamChange = (name: string, field: 'start' | 'end' | 'step', value: string) => {
    setOptimizationParams(prev => ({...prev, [name]: { ...prev[name], [field]: parseFloat(value) }}));
  }

  const runBacktest = async () => {
    setIsRunning(true);
    setBacktestResults(null);
    setError(null);

    const formData = new FormData();

    formData.append('mode', activeTab);
    formData.append('strategy', selectedStrategy);
    formData.append('dataSource', dataSource);
    formData.append('timeframe', timeframe);

    formData.append('cash', simulationConfig.cash.toString());
    formData.append('commission', simulationConfig.commission.toString());
    formData.append('margin', simulationConfig.margin.toString());
    
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
      if (startDate) formData.append('startDate', format(startDate, 'yyyy-MM-dd'));
      if (endDate) formData.append('endDate', format(endDate, 'yyyy-MM-dd'));
    }

    if (activeTab === 'single') {
        formData.append('params', JSON.stringify(singleParams));
    } else { // 'optimize'
        formData.append('optimization_params', JSON.stringify(optimizationParams));
        formData.append('optimization_config', JSON.stringify(optimizationConfig));
    }

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as BacktestError).error || 'An unknown error occurred.');
      }
      
      const finalResult = result as any;
      if (activeTab === 'single' && !finalResult.asset_long_name && dataSource === 'yahoo') {
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


  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Backtest Configuration</CardTitle>
            <CardDescription>Configure and run your backtest or optimization.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={['strategy', 'data_source', 'parameters']} className="w-full">
              
              {/* --- Strategy --- */}
              <AccordionItem value="strategy">
                 <AccordionTrigger className="text-base font-semibold">Strategy</AccordionTrigger>
                 <AccordionContent className="grid gap-6 pt-4">
                    <div className="grid gap-3">
                      <Label htmlFor="strategy">Strategy</Label>
                      <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                        <SelectTrigger id="strategy"><SelectValue placeholder="Select strategy" /></SelectTrigger>
                        <SelectContent>
                          {strategies.map(s => <SelectItem key={s.id} value={s.id} disabled={!s.active}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                 </AccordionContent>
              </AccordionItem>

              {/* --- Data Source --- */}
              <AccordionItem value="data_source">
                <AccordionTrigger className="text-base font-semibold">Data Source</AccordionTrigger>
                <AccordionContent className="grid gap-6 pt-4">
                  <RadioGroup value={dataSource} onValueChange={setDataSource} className="flex items-center gap-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yahoo" id="yahoo" /><Label htmlFor="yahoo">Yahoo Finance</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="csv" id="csv" /><Label htmlFor="csv">CSV Upload</Label></div>
                  </RadioGroup>
                  {dataSource === 'yahoo' && (
                    <div className="grid gap-6 pt-4">
                      <div className="grid gap-3">
                        <Label htmlFor="ticker">Ticker</Label>
                        <Input id="ticker" ref={tickerRef} defaultValue="SPY" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="grid gap-3">
                            <Label htmlFor="timeframe">Timeframe</Label>
                            <Select value={timeframe} onValueChange={setTimeframe}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                {timeframes.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-3"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal',!startDate && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                          </Popover>
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="end-date">End Date</Label>
                          <Popover>
                             <PopoverTrigger asChild>
                              <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !endDate && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  )}
                  {dataSource === 'csv' && (
                    <div className="grid gap-3 pt-4">
                      <Label htmlFor="csv-file">CSV File</Label>
                      <Input id="csv-file" type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)} />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* --- Parameters --- */}
              <AccordionItem value="parameters">
                <AccordionTrigger className="text-base font-semibold">Parameters</AccordionTrigger>
                <AccordionContent className="pt-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="single">Backtest</TabsTrigger>
                      <TabsTrigger value="optimize">Optimization</TabsTrigger>
                    </TabsList>
                    <TabsContent value="single" className="grid gap-4 pt-4">
                      {currentStrategyParams.map(param => (
                        <div key={param.name} className="grid gap-3">
                           <div className="flex items-center justify-between">
                             <Label htmlFor={`single-${param.name}`}>{param.name.replace(/_/g, ' ')}</Label>
                             <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                                <TooltipContent><p>{param.description}</p></TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                           </div>
                          <Input id={`single-${param.name}`} type="number" value={singleParams[param.name] || ''} onChange={e => handleSingleParamChange(param.name, e.target.value)} step={param.step}/>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="optimize" className="pt-4">
                      <Accordion type="multiple" defaultValue={['opt_params']}>
                        <AccordionItem value="opt_params">
                          <AccordionTrigger>Strategy Parameters</AccordionTrigger>
                          <AccordionContent className="grid gap-6 pt-4">
                            {currentStrategyParams.map(param => (
                              <div key={param.name} className="grid gap-3">
                                 <Label>{param.name.replace(/_/g, ' ')}</Label>
                                <div className="grid grid-cols-3 gap-2">
                                  <Input placeholder="Start" type="number" value={optimizationParams[param.name]?.start || ''} onChange={e => handleOptimizationParamChange(param.name, 'start', e.target.value)} />
                                  <Input placeholder="End" type="number" value={optimizationParams[param.name]?.end || ''} onChange={e => handleOptimizationParamChange(param.name, 'end', e.target.value)} />
                                  <Input placeholder="Step" type="number" value={optimizationParams[param.name]?.step || ''} onChange={e => handleOptimizationParamChange(param.name, 'step', e.target.value)} />
                                </div>
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="opt_settings">
                          <AccordionTrigger>Optimization Settings</AccordionTrigger>
                          <AccordionContent className="grid gap-4 pt-4">
                              <div className="grid gap-3">
                                <Label htmlFor="maximize">Metric to Maximize</Label>
                                <Select value={optimizationConfig.maximize} onValueChange={(value) => setOptimizationConfig(p => ({...p, maximize: value}))}>
                                  <SelectTrigger><SelectValue/></SelectTrigger>
                                  <SelectContent>{optimizationMetrics.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                               <div className="grid gap-3">
                                <Label htmlFor="max_tries">Max Tries</Label>
                                <Input id="max_tries" type="number" value={optimizationConfig.maxTries} onChange={(e) => setOptimizationConfig(p => ({...p, maxTries: parseInt(e.target.value)}))}/>
                              </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
              
              {/* --- Simulation Settings --- */}
               <AccordionItem value="simulation">
                <AccordionTrigger className="text-base font-semibold">Simulation Settings</AccordionTrigger>
                <AccordionContent className="grid gap-4 pt-4">
                    <div className="grid gap-3">
                        <Label htmlFor="cash">Initial Capital</Label>
                        <Input id="cash" type="number" value={simulationConfig.cash} onChange={handleSimulationConfigChange} />
                    </div>
                     <div className="grid gap-3">
                        <Label htmlFor="commission">Commission (%)</Label>
                        <Input id="commission" type="number" value={simulationConfig.commission} onChange={handleSimulationConfigChange} step={0.001}/>
                    </div>
                     <div className="grid gap-3">
                        <Label htmlFor="margin">Margin</Label>
                        <Input id="margin" type="number" value={simulationConfig.margin} onChange={handleSimulationConfigChange} step={0.1}/>
                    </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button className="w-full" onClick={runBacktest} disabled={isRunning}>
              {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {isRunning ? 'Running...' : (activeTab === 'single' ? 'Run Backtest' : 'Run Optimization')}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <ResultsDisplay results={backtestResults} error={error} isRunning={isRunning} mode={activeTab} />
      </div>
    </div>
  );
}

// --- Sub-components for Results Display ---

const ResultsDisplay = ({ results, error, isRunning, mode }: { results: any, error: string | null, isRunning: boolean, mode: string }) => {
  if (isRunning) {
    return (
        <Card className="text-center"><CardContent className="p-6"><div className="flex flex-col items-center gap-4"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><p className="text-muted-foreground">Running backtest...</p></div></CardContent></Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!results) {
    return (
         <Card><CardContent className="p-6"><div className="text-center text-muted-foreground"><BarChart className="mx-auto h-12 w-12"/> <h3 className="mt-4 text-lg font-medium">No results yet</h3><p>Configure your backtest and click 'Run' to see the results.</p></div></CardContent></Card>
    );
  }
  
  // For optimization, result is a list, for single it's an object. Let's check the best result.
  const summary = mode === 'optimize' ? results.best_result?.summary : results.summary;
  const trades = mode === 'optimize' ? results.best_result?.trades : results.trades;
  const equityCurve = mode === 'optimize' ? results.best_result?.equity_curve : results.equity_curve;

  if (!summary) {
     return (
        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Invalid Results</AlertTitle><AlertDescription>The backtest completed but the results format is not recognized.</AlertDescription></Alert>
     )
  }

  const equityData = Object.keys(equityCurve || {}).map(date => ({
      date,
      equity: equityCurve[date]
  }));

  return (
    <Tabs defaultValue="report">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="report">Report</TabsTrigger>
        <TabsTrigger value="chart">Chart</TabsTrigger>
        <TabsTrigger value="trades">Trades</TabsTrigger>
      </TabsList>
      <TabsContent value="report">
        {mode === 'optimize' && results.best_params && (
            <BestParameters params={results.best_params} />
        )}
        <BacktestSummary summary={summary}/>
      </TabsContent>
      <TabsContent value="chart">
          <EquityChart data={equityData} />
      </TabsContent>
      <TabsContent value="trades">
          <TradesTable trades={trades} />
      </TabsContent>
    </Tabs>
  );
};

const BacktestSummary = ({ summary }: { summary: any }) => {
    const formatValue = (key: string, value: any) => {
        if (typeof value !== 'number') return value;
        if (key.includes('[%]') || key.includes('rate') || key.includes('pct')) return `${value.toFixed(2)}%`;
        if (key.includes('Capital') || key.includes('Equity') || key.includes('pnl')) return `$${value.toFixed(2)}`;
        return value;
    }

    const mainMetrics = {
        'Start Capital': summary.initial_capital,
        'End Equity': summary.final_equity,
        'Total Return [%]': summary.total_return_pct,
        'Max Drawdown [%]': summary.max_drawdown_pct,
        'Win Rate [%]': summary.win_rate_pct,
        'Sharpe Ratio': summary.sharpe_ratio,
    };

    const tradeMetrics = {
        'Total Trades': summary.total_trades,
        'Winning Trades': summary.winning_trades,
        'Losing Trades': summary.losing_trades,
    };

    return (
        <Card>
            <CardHeader><CardTitle>Backtest Summary</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <h3 className="font-semibold">Key Metrics</h3>
                    <Table>
                        <TableBody>
                            {Object.entries(mainMetrics).map(([key, value]) => (
                                <TableRow key={key}><TableCell className="font-medium">{key}</TableCell><TableCell className="text-right">{formatValue(key, value)}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold">Trade Stats</h3>
                    <Table>
                        <TableBody>
                             {Object.entries(tradeMetrics).map(([key, value]) => (
                                <TableRow key={key}><TableCell className="font-medium">{key}</TableCell><TableCell className="text-right">{value}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

const BestParameters = ({ params }: { params: any }) => (
    <Card className="mb-4 bg-yellow-50 border-yellow-200">
        <CardHeader><CardTitle className="text-yellow-900">Best Parameters Found</CardTitle></CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow><TableHead>Parameter</TableHead><TableHead className="text-right">Value</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(params).map(([key, value]) => (
                        <TableRow key={key}><TableCell className="font-medium">{key.replace(/_/g, ' ')}</TableCell><TableCell className="text-right">{String(value)}</TableCell></TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
)

const EquityChart = ({ data }: { data: any[] }) => (
    <Card>
        <CardHeader><CardTitle>Equity Curve</CardTitle></CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={['dataMin', 'dataMax']} tickFormatter={(value) => `$${value.toLocaleString()}`} fontSize={12} tickLine={false} axisLine={false}/>
                    <Tooltip content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                            <div className="p-2 bg-background border rounded-lg shadow-lg">
                                <p className="label">{`${label}`}</p>
                                <p className="intro" style={{color: payload[0].color}}>{`Equity: $${Number(payload[0].value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>

                            </div>
                            );
                        }
                        return null;
                        }}/>
                    <Legend />
                    <Area type="monotone" dataKey="equity" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

const TradesTable = ({ trades }: { trades: any[] }) => (
    <Card>
        <CardHeader><CardTitle>Trade Log</CardTitle><CardDescription>{trades.length} trades executed</CardDescription></CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead className="text-right">Shares</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {trades.map((trade, index) => (
                        <TableRow key={index}>
                            <TableCell>{format(new Date(trade.date), 'yyyy-MM-dd')}</TableCell>
                            <TableCell>{trade.asset}</TableCell>
                            <TableCell>
                                <span className={cn('font-medium', trade.direction === 'BUY' ? 'text-green-600' : 'text-red-600')}>{trade.direction}</span>
                            </TableCell>
                            <TableCell className="text-right">{Math.abs(trade.shares)}</TableCell>
                            <TableCell className="text-right">{`$${trade.price.toFixed(2)}`}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);