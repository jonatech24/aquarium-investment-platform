
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const strategies = [
  {
    id: 'trendfollowing',
    name: 'Trend Following',
    markets: 'All',
    complexity: 'Low',
    holdingPeriod: 'Days-Weeks',
    keyIndicator: 'Moving Averages',
    pnl: 4200,
    status: 'active',
    description: 'This strategy identifies the direction of the market and takes a position in the same direction. It typically uses moving averages to determine the trend.',
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
    description: 'TWAP is an execution strategy that breaks down a large order into smaller ones and executes them at regular intervals over a specified time period. This is done to minimize market impact.',
  },
  {
    id: 'bullflag',
    name: 'Bull Flag Momentum',
    markets: 'Equities',
    complexity: 'Low',
    holdingPeriod: 'Minutes',
    keyIndicator: 'Volume Spike',
    pnl: 0,
    status: 'active',
    description: 'A classic momentum strategy that looks for a strong price increase (the flagpole) followed by a period of consolidation (the flag). The strategy enters a long position when the price breaks out of the flag formation.',
  },
  {
    id: 'matrendtrading',
    name: 'Moving Average Trend',
    markets: 'All',
    complexity: 'Low',
    holdingPeriod: 'Days-Weeks',
    keyIndicator: 'Moving Average Crossover',
    pnl: 0,
    status: 'active',
    description: 'A simple trend-following strategy that uses two moving averages, a fast one and a slow one. A buy signal is generated when the fast moving average crosses above the slow moving average, and a sell signal is generated when it crosses below.',
  },
  {
    id: 'openingrangebreakout',
    name: 'Opening Range Breakout',
    markets: 'Equities',
    complexity: 'Low',
    holdingPeriod: 'Minutes',
    keyIndicator: 'Opening Range High/Low',
    pnl: 0,
    status: 'active',
    description: 'This strategy identifies the high and low of a specific period after the market opens (the opening range). A buy order is placed if the price breaks above the opening range high, and a sell order is placed if it breaks below the opening range low.',
  },
  {
    id: 'gapandgo',
    name: 'Gap and Go',
    markets: 'Equities',
    complexity: 'Medium',
    holdingPeriod: 'Minutes-Hours',
    keyIndicator: 'Volume Surge',
    pnl: 2750,
    status: 'active',
    description: 'This strategy looks for stocks that have a significant price gap up from the previous day\'s close on high volume. The strategy assumes that the momentum will continue in the same direction.',
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
    description: 'This strategy is based on the assumption that asset prices tend to revert to their historical mean. It identifies overbought or oversold conditions and takes a contrarian position.',
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
    description: 'This strategy involves buying assets that have shown an upward trend in price and selling those that have shown a downward trend. It is based on the idea that trends are likely to continue.',
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
    description: 'VWAP is an execution strategy that aims to execute an order at the volume-weighted average price. It is often used as a benchmark for the quality of execution.',
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
    description: 'This is an execution strategy that participates in the market at a specified rate of the total trading volume. This helps to reduce the market impact of large orders.',
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
    description: 'This strategy involves making trading decisions based on public news and events. For example, a positive earnings report might trigger a buy order.',
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
    description: 'Scalping is a very short-term trading style that aims to profit from small price changes. Scalpers execute a large number of trades in a single day.',
  },
  {
    id: 'abcdpattern',
    name: 'ABCD Pattern',
    markets: 'Equities',
    complexity: 'Medium',
    holdingPeriod: 'Minutes-Hours',
    keyIndicator: 'Fibonacci Retracement',
    pnl: 0,
    status: 'active',
    description: 'A classic chart pattern that consists of four points (A, B, C, and D) that represent a specific sequence of price movements. The pattern can be used to identify potential buying or selling opportunities.',
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
    description: 'Arbitrage involves taking advantage of price differences for the same asset in different markets. It is a risk-free strategy if executed correctly.',
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
    description: 'A quantitative trading strategy that uses statistical models to identify and exploit temporary pricing inefficiencies between related financial instruments.',
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
    description: 'Market making involves providing liquidity to the market by simultaneously quoting buy and sell prices for an asset. Market makers profit from the bid-ask spread.',
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
    description: 'An execution strategy that aims to minimize the difference between the decision price and the final execution price of an order. It is a more advanced execution strategy.',
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
    description: 'HFT is a type of algorithmic trading that involves executing a very large number of orders in fractions of a second. It requires sophisticated technology and a deep understanding of market microstructure.',
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
    description: 'This involves using machine learning models to identify trading signals and make trading decisions. It is a highly quantitative and data-driven approach to trading.',
  },
  {
    id: 'reversaltrading',
    name: 'Reversal Trading',
    markets: 'Equities/Forex',
    complexity: 'High',
    holdingPeriod: 'Hours-Days',
    keyIndicator: 'Divergence',
    pnl: 0,
    status: 'inactive',
    description: 'This strategy involves identifying potential trend reversals and taking a position in the opposite direction of the prevailing trend. It is the opposite of trend following.',
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
                  <TableCell className="font-medium">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>{strategy.name}</TooltipTrigger>
                        <TooltipContent>
                          <p>{strategy.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
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
