
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
import { CandlestickChart } from '@/components/candlestick-chart';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';

const strategies = [
  { id: 'gapandgo', name: 'Gap and Go' },
  { id: 'trendfollowing', name: 'Trend Following' },
  { id: 'meanreversion', name: 'Mean Reversion' },
  { id: 'momentum', name: 'Momentum Trading' },
  { id: 'arbitrage', name: 'Arbitrage' },
  { id: 'statisticalarbitrage', name: 'Statistical Arbitrage' },
  { id: 'marketmaking', name: 'Market Making' },
  { id: 'vwap', name: 'VWAP' },
  { id: 'twap', name: 'TWAP' },
  { id: 'pov', name: 'POV' },
  { id: 'implementationshortfall', name: 'Implementation Shortfall' },
  { id: 'hft', name: 'HFT' },
  { id: 'machinelearning', name: 'Machine Learning' },
  { id: 'eventdriven', name: 'Event-Driven' },
  { id: 'scalping', name: 'Scalping' },
];

const strategyParamsConfig: Record<
  string,
  { name: string; defaultValue: number; min: number; max: number; step: number }[]
> = {
  trendfollowing: [
    { name: 'Fast MA', defaultValue: 50, min: 10, max: 100, step: 1 },
    { name: 'Slow MA', defaultValue: 200, min: 100, max: 300, step: 1 },
  ],
  meanreversion: [
    { name: 'Bollinger Period', defaultValue: 20, min: 10, max: 50, step: 1 },
    { name: 'Deviation Factor', defaultValue: 2, min: 1, max: 4, step: 0.1 },
  ],
  momentum: [
    { name: 'ROC Period', defaultValue: 14, min: 5, max: 30, step: 1 },
  ],
  gapandgo: [
    { name: 'Gap Threshold (%)', defaultValue: 2, min: 0.5, max: 10, step: 0.1 },
  ],
};

export default function BacktestingPage() {
  const searchParams = useSearchParams();
  const strategyParam = searchParams.get('strategy');
  const [selectedStrategy, setSelectedStrategy] = useState(
    strategyParam || 'trendfollowing'
  );
  
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
                    <Input id="ticker" type="text" defaultValue="AAPL" />
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
                        defaultValue="2023-12-31"
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
                          <Label htmlFor={param.name}>{param.name}</Label>
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
            <Button className="w-full">Run Backtest</Button>
          </CardFooter>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <Tabs defaultValue="summary">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Backtest Results</CardTitle>
                <CardDescription>
                  Summary of performance metrics for{' '}
                  {selectedStrategy && (
                    <span className="capitalize font-medium">
                      {getStrategyName(selectedStrategy)}
                    </span>
                  )}
                  .
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Final Portfolio Value</CardDescription>
                    <CardTitle className="text-4xl">$124,532.10</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      +24.53% total return
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Sharpe Ratio</CardDescription>
                    <CardTitle className="text-4xl">1.78</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Annualized
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2023-01-20</TableCell>
                      <TableCell>
                        <Badge
                          className="text-green-300 bg-green-800/60"
                          variant="outline"
                        >
                          BUY
                        </Badge>
                      </TableCell>
                      <TableCell>$135.20</TableCell>
                      <TableCell>10</TableCell>
                      <TableCell>$1,352.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2023-02-15</TableCell>
                      <TableCell>
                        <Badge
                          className="text-red-300 bg-red-800/60"
                          variant="outline"
                        >
                          SELL
                        </Badge>
                      </TableCell>
                      <TableCell>$148.50</TableCell>
                      <TableCell>10</TableCell>
                      <TableCell>$1,485.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>Performance Chart</CardTitle>
                <CardDescription>
                  Visual representation of the backtest performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CandlestickChart />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
