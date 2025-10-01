
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, FlaskConical, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const strategies = [
  {
    id: 'gapandgo',
    name: 'Gap and Go',
    markets: 'Equities',
    complexity: 'Medium',
    holdingPeriod: 'Minutes-Hours',
    keyIndicator: 'Volume Surge',
    pnl: 2750,
    status: 'active',
  },
  {
    id: 'trendfollowing',
    name: 'Trend Following',
    markets: 'All',
    complexity: 'Low',
    holdingPeriod: 'Days-Weeks',
    keyIndicator: 'Moving Averages',
    pnl: 4200,
    status: 'active',
  },
  {
    id: 'meanreversion',
    name: 'Mean Reversion',
    markets: 'Equities/Forex',
    complexity: 'Medium',
    holdingPeriod: 'Hours-Days',
    keyIndicator: 'Bollinger Bands',
    pnl: -1500,
    status: 'inactive',
  },
  {
    id: 'momentum',
    name: 'Momentum Trading',
    markets: 'Equities',
    complexity: 'Medium',
    holdingPeriod: 'Weeks-Months',
    keyIndicator: 'ROC/RSI',
    pnl: 800,
    status: 'active',
  },
  {
    id: 'arbitrage',
    name: 'Arbitrage',
    markets: 'All',
    complexity: 'High',
    holdingPeriod: 'Seconds-Minutes',
    keyIndicator: 'Price Scanner',
    pnl: 3100,
    status: 'inactive',
  },
  {
    id: 'statisticalarbitrage',
    name: 'Statistical Arbitrage',
    markets: 'Equities/Futures',
    complexity: 'High',
    holdingPeriod: 'Minutes-Days',
    keyIndicator: 'Cointegration Test',
    pnl: 5500,
    status: 'active',
  },
  {
    id: 'marketmaking',
    name: 'Market Making',
    markets: 'All',
    complexity: 'High',
    holdingPeriod: 'Seconds',
    keyIndicator: 'Order Book API',
    pnl: 12000,
    status: 'active',
  },
  {
    id: 'vwap',
    name: 'VWAP',
    markets: 'Equities',
    complexity: 'Medium',
    holdingPeriod: 'Hours',
    keyIndicator: 'Volume Profiles',
    pnl: 1800,
    status: 'inactive',
  },
  {
    id: 'twap',
    name: 'TWAP',
    markets: 'Equities',
    complexity: 'Low',
    holdingPeriod: 'Hours',
    keyIndicator: 'Time Slots',
    pnl: 950,
    status: 'active',
  },
  {
    id: 'pov',
    name: 'POV',
    markets: 'Equities',
    complexity: 'Medium',
    holdingPeriod: 'Hours',
    keyIndicator: 'Volume Monitor',
    pnl: -500,
    status: 'inactive',
  },
  {
    id: 'implementationshortfall',
    name: 'Implementation Shortfall',
    markets: 'Equities',
    complexity: 'High',
    holdingPeriod: 'Minutes-Hours',
    keyIndicator: 'Cost Optimizer',
    pnl: 2100,
    status: 'active',
  },
  {
    id: 'hft',
    name: 'HFT',
    markets: 'All',
    complexity: 'High',
    holdingPeriod: 'Milliseconds',
    keyIndicator: 'Latency Tools',
    pnl: 25000,
    status: 'active',
  },
  {
    id: 'machinelearning',
    name: 'Machine Learning',
    markets: 'All',
    complexity: 'High',
    holdingPeriod: 'Varies',
    keyIndicator: 'Neural Networks',
    pnl: 7800,
    status: 'active',
  },
  {
    id: 'eventdriven',
    name: 'Event-Driven',
    markets: 'All',
    complexity: 'Medium',
    holdingPeriod: 'Minutes-Hours',
    keyIndicator: 'NLP Parsers',
    pnl: 3200,
    status: 'active',
  },
  {
    id: 'scalping',
    name: 'Scalping',
    markets: 'Forex',
    complexity: 'Medium',
    holdingPeriod: 'Seconds-Minutes',
    keyIndicator: 'Tick Data',
    pnl: 4800,
    status: 'active',
  },
];


export default function StrategiesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Strategies</h1>
          <p className="text-muted-foreground">
            Manage your trading strategies and create new ones.
          </p>
        </div>
        <Link href="/strategies/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Strategy
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Strategies</CardTitle>
          <CardDescription>
            A curated list of trading strategies. Use them as a starting point for your own custom automated trading systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Strategy</TableHead>
                <TableHead>Typical Markets</TableHead>
                <TableHead>Complexity</TableHead>
                <TableHead>Holding Period</TableHead>
                <TableHead>Key Indicator/Tool</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Lifetime P&L</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategies.map((strategy) => (
                <TableRow key={strategy.id}>
                  <TableCell className="font-medium">{strategy.name}</TableCell>
                  <TableCell className="text-muted-foreground">{strategy.markets}</TableCell>
                  <TableCell className="text-muted-foreground">{strategy.complexity}</TableCell>
                  <TableCell className="text-muted-foreground">{strategy.holdingPeriod}</TableCell>
                  <TableCell className="text-muted-foreground">{strategy.keyIndicator}</TableCell>
                  <TableCell>
                    <Badge variant={strategy.status === 'active' ? 'secondary' : 'outline'} className={strategy.status === 'active' ? 'bg-green-800/80 text-green-300' : ''}>
                      {strategy.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-mono ${strategy.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${strategy.pnl.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/strategies/${strategy.id}`}>
                        <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Link href={`/backtesting?strategy=${strategy.id}`}>
                         <Button variant="ghost" size="icon">
                            <FlaskConical className="h-4 w-4" />
                             <span className="sr-only">Backtest</span>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
