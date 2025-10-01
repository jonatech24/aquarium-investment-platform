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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const strategies = [
  {
    id: 'gapandgo',
    name: 'Gap and Go',
  },
  {
    id: 'trendfollowing',
    name: 'Trend Following',
  },
  {
    id: 'meanreversion',
    name: 'Mean Reversion',
  },
  {
    id: 'momentum',
    name: 'Momentum Trading',
  },
  {
    id: 'arbitrage',
    name: 'Arbitrage',
  },
  {
    id: 'statisticalarbitrage',
    name: 'Statistical Arbitrage',
  },
  {
    id: 'marketmaking',
    name: 'Market Making',
  },
  {
    id: 'vwap',
    name: 'VWAP',
  },
  {
    id: 'twap',
    name: 'TWAP',
  },
  {
    id: 'pov',
    name: 'POV',
  },
  {
    id: 'implementationshortfall',
    name: 'Implementation Shortfall',
  },
  {
    id: 'hft',
    name: 'HFT',
  },
  {
    id: 'machinelearning',
    name: 'Machine Learning',
  },
  {
    id: 'eventdriven',
    name: 'Event-Driven',
  },
  {
    id: 'scalping',
    name: 'Scalping',
  },
];

export default function BacktestingPage() {
  const searchParams = useSearchParams();
  const strategyParam = searchParams.get('strategy');
  const [selectedStrategy, setSelectedStrategy] = useState(strategyParam || 'trendfollowing');

  useEffect(() => {
    if (strategyParam) {
      setSelectedStrategy(strategyParam);
    }
  }, [strategyParam]);

  const getStrategyName = (id: string) => {
    return strategies.find(s => s.id === id)?.name || id;
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Backtest Configuration</CardTitle>
            <CardDescription>
              Set up the parameters for your backtest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="ticker">Ticker</Label>
                <Input id="ticker" type="text" defaultValue="AAPL" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="strategy">Strategy</Label>
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger id="strategy">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map(strategy => (
                        <SelectItem key={strategy.id} value={strategy.id}>{strategy.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" defaultValue="2023-01-01" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" defaultValue="2023-12-31" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="capital">Initial Capital</Label>
                <Input id="capital" type="number" defaultValue="100000" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Run Backtest</Button>
          </CardFooter>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
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
                <CardDescription>Summary of performance metrics for {selectedStrategy && <span className="capitalize font-medium">{getStrategyName(selectedStrategy)}</span>}.</CardDescription>
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
                      <TableCell><Badge className="text-green-300 bg-green-800/60" variant="outline">BUY</Badge></TableCell>
                      <TableCell>$135.20</TableCell>
                      <TableCell>10</TableCell>
                      <TableCell>$1,352.00</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>2023-02-15</TableCell>
                      <TableCell><Badge className="text-red-300 bg-red-800/60" variant="outline">SELL</Badge></TableCell>
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
                    <CardDescription>Visual representation of the backtest performance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative aspect-video w-full">
                        <Image src="https://picsum.photos/seed/candlestick/1200/675" alt="Backtest candlestick chart" fill data-ai-hint="candlestick chart" className="rounded-md object-cover"/>
                    </div>
                </CardContent>
            </Card>
           </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
