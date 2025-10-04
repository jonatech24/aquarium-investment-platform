
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUp,
  ArrowDown,
  Activity,
  DollarSign,
  Users,
  CreditCard,
} from 'lucide-react';
import {
  PortfolioChart,
  StrategyPerformanceChart,
} from '@/components/dashboard-charts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const tradeAccounts = [
  {
    id: 'acc_ib_real',
    name: 'Interactive Brokers - Real',
    portfolioValue: '$45,231.89',
    portfolioChange: '+20.1% from last month',
    activeStrategies: '+12',
    activeStrategiesChange: '+180.1% from last month',
    totalTrades: '+12,234',
    totalTradesChange: '+19% from last month',
    backtestsRan: '+573',
    backtestsRanChange: '+201 since last hour',
    trades: [
      {
        ticker: 'AAPL',
        side: 'BUY',
        amount: '$2,500.00',
        price: '$205.50',
      },
      {
        ticker: 'TSLA',
        side: 'SELL',
        amount: '$5,100.00',
        price: '$180.12',
      },
       {
        ticker: 'MSFT',
        side: 'BUY',
        amount: '$3,000.00',
        price: '$445.60',
      },
    ],
  },
  {
    id: 'acc_alpaca_paper',
    name: 'Alpaca - Paper Trading',
    portfolioValue: '$1,250.72',
    portfolioChange: '-2.5% from last month',
    activeStrategies: '+3',
    activeStrategiesChange: '+50% from last month',
    totalTrades: '+543',
    totalTradesChange: '-5% from last month',
    backtestsRan: '+88',
    backtestsRanChange: '+10 since last hour',
    trades: [
      {
        ticker: 'NVDA',
        side: 'BUY',
        amount: '$10,000.00',
        price: '$120.50',
      },
      {
        ticker: 'GOOG',
        side: 'BUY',
        amount: '$8,000.00',
        price: '$175.25',
      },
    ],
  },
  {
    id: 'acc_etrade_swing',
    name: 'E-Trade - Swing Account',
    portfolioValue: '$15,842.55',
    portfolioChange: '+10.2% from last month',
    activeStrategies: '+7',
    activeStrategiesChange: '+12.1% from last month',
    totalTrades: '+2,110',
    totalTradesChange: '+8% from last month',
    backtestsRan: '+215',
    backtestsRanChange: '+55 since last hour',
    trades: [
      {
        ticker: 'AMD',
        side: 'SELL',
        amount: '$4,200.00',
        price: '$165.80',
      },
    ],
  },
];

export default function Dashboard() {
  const [selectedAccountId, setSelectedAccountId] = useState(tradeAccounts[0].id);
  
  const selectedAccount = tradeAccounts.find(acc => acc.id === selectedAccountId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Select Account" />
          </SelectTrigger>
          <SelectContent>
            {tradeAccounts.map(account => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolio Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedAccount?.portfolioValue}</div>
            <p className="text-xs text-muted-foreground">
              {selectedAccount?.portfolioChange}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Strategies
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedAccount?.activeStrategies}</div>
            <p className="text-xs text-muted-foreground">
              {selectedAccount?.activeStrategiesChange}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedAccount?.totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              {selectedAccount?.totalTradesChange}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Backtests Ran
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedAccount?.backtestsRan}</div>
            <p className="text-xs text-muted-foreground">
              {selectedAccount?.backtestsRanChange}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Strategy Performance</CardTitle>
            <CardDescription>
              Performance of your top 5 strategies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StrategyPerformanceChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="grid gap-2">
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>
                Recent trades from your active accounts.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead className="text-center">Side</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedAccount?.trades.map((trade, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="font-medium">{trade.ticker}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className={trade.side === 'BUY' ? "bg-green-800/80 text-green-300" : "bg-red-800/80 text-red-300"}>
                        {trade.side}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{trade.amount}</TableCell>
                    <TableCell className="text-right">{trade.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>News Sentiment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-4">
              <div className="font-semibold text-lg">NVDA</div>
              <div className="flex items-center gap-2 text-green-400 ml-auto">
                <ArrowUp className="h-5 w-5" />
                <span>Strong Positive</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-semibold text-lg">AMD</div>
              <div className="flex items-center gap-2 text-green-400 ml-auto">
                <ArrowUp className="h-5 w-5" />
                <span>Positive</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-semibold text-lg">INTC</div>
              <div className="flex items-center gap-2 text-red-400 ml-auto">
                <ArrowDown className="h-5 w-5" />
                <span>Slightly Negative</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
