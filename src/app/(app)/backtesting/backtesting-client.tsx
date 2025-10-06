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
import { useEffect, useState, useRef, useMemo } from 'react';
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
import { Terminal, CalendarIcon, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// --- CONFIGURATION ---
const BACKEND_URL = 'https://aquarium-investment-platform-studio-2799607830-e7b65.us-east4.hosted.app';

const strategies = [
    { id: 'trend_following', name: 'Trend Following', active: true },
    { id: 'dependency_free_strategy', name: 'Dependency Free Strategy', active: true },
    { id: 'ma_cross', name: 'Moving Average Crossover', active: true },
    { id: 'rsi', name: 'RSI Momentum', active: true },
];

const timeframes = {
    yahoo: ['1d', '5d', '1wk', '1mo', '3mo'],
    polygon: ['1m', '5m', '15m', '30m', '1h', '4h', '1d'],
    alpaca: ['1m', '5m', '15m', '1h', '1d'],
};


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
   ma_cross: [
    { name: 'Fast MA', defaultValue: 50, min: 10, max: 100, step: 1, description: 'Period for the fast moving average.' },
    { name: 'Slow MA', defaultValue: 200, min: 100, max: 300, step: 1, description: 'Period for the slow moving average.' },
  ],
  rsi: [
    { name: 'RSI Period', defaultValue: 14, min: 7, max: 28, step: 1, description: 'Period for the RSI calculation.' },
    { name: 'Oversold Threshold', defaultValue: 30, min: 20, max: 40, step: 1, description: 'RSI value below which an asset is considered oversold.' },
    { name: 'Overbought Threshold', defaultValue: 70, min: 60, max: 80, step: 1, description: 'RSI value above which an asset is considered overbought.' },
  ],

};

const optimizationMetrics = [
  'SQN', 'Return [%]', 'Sharpe Ratio', 'Sortino Ratio', 'Calmar Ratio', 'Max. Drawdown [%]', 'Win Rate [%]'
];

// --- TYPE DEFINITIONS ---
interface BacktestResults { /* ... existing interface ... */ }
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
  const [timeframe, setTimeframe] = useState('1d');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date('2023-01-01'));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date('2024-01-01'));

  // Simulation Config
  const [simulationConfig, setSimulationConfig] = useState({
    cash: 100000,
    commission: 0.001,
    margin: 1.0,
    tradeOnClose: false,
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
    const { id, value, type, checked } = e.target;
    setSimulationConfig(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : parseFloat(value) }));
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

    // Append mode and general settings
    formData.append('mode', activeTab);
    formData.append('strategy', selectedStrategy);
    formData.append('dataSource', dataSource);
    formData.append('timeframe', timeframe);

    // Append simulation config from state
    formData.append('cash', simulationConfig.cash.toString());
    formData.append('commission', simulationConfig.commission.toString());
    formData.append('margin', simulationConfig.margin.toString());
    
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

    // Append parameters based on mode
    if (activeTab === 'single') {
        // For single run, pass parameters as a JSON string
        formData.append('params', JSON.stringify(singleParams));
    } else { // 'optimize'
        // For optimization, pass ranges and config
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
      // In a single backtest, we might want to enrich the result with the ticker name client-side
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
            <CardDescription>Configure your backtest or optimization run.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={['strategy', 'data_source', 'parameters']} className="w-full">
              
              {/* --- General and Data Source --- */}
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

              <AccordionItem value="data_source">
                <AccordionTrigger className="text-base font-semibold">Data Source</AccordionTrigger>
                <AccordionContent className="grid gap-6 pt-4">
                  <div className="grid gap-3">
                    <Label>Source</Label>
                    <RadioGroup
                      value={dataSource}
                      onValueChange={setDataSource}
                      className="flex items-center gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yahoo" id="yahoo" />
                        <Label htmlFor="yahoo">Yahoo Finance</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="polygon" id="polygon" />
                        <Label htmlFor="polygon">Polygon</Label>
                      </div>
                       <div className="flex items-center space-x-2">
                        <RadioGroupItem value="alpaca" id="alpaca" />
                        <Label htmlFor="alpaca">Alpaca</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="csv" id="csv" />
                        <Label htmlFor="csv">CSV Upload</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {dataSource !== 'csv' && (
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="ticker">Ticker</Label>
                        <Input
                          id="ticker"
                          ref={tickerRef}
                          defaultValue="SPY"
                        />
                      </div>

                      <div className="grid gap-3">
                          <Label htmlFor="timeframe">Timeframe</Label>
                          <Select value={timeframe} onValueChange={setTimeframe}>
                              <SelectTrigger id="timeframe"><SelectValue placeholder="Select timeframe" /></SelectTrigger>
                              <SelectContent>
                                  {timeframes[dataSource as keyof typeof timeframes].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !startDate && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
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
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !endDate && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
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
                    <div className="grid gap-3">
                      <Label htmlFor="csv-file">CSV File</Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                      />
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

                    {/* SINGLE BACKTEST TAB */}
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

                    {/* OPTIMIZATION TAB */}
                    <TabsContent value="optimize" className="pt-4">
                      <Accordion type="multiple" defaultValue={['opt_params', 'opt_settings']}>
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
                                  <SelectContent>
                                    {optimizationMetrics.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                  </SelectContent>
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
              {isRunning ? 'Running...' : (activeTab === 'single' ? 'Run Backtest' : 'Run Optimization')}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
         {/* ... Existing Results Display Area (Tabs for Summary, Chart, Trades) ... */}
      </div>
    </div>
  );
}
