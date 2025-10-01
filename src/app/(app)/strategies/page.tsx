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
    id: 'gridbot',
    name: 'GridBot',
    description: 'Places buy/sell orders at regular intervals above and below a set price.',
    pnl: 2750,
    status: 'active',
  },
  {
    id: 'momentum',
    name: 'Momentum',
    description: 'Buys assets that have been showing an upward trend in price.',
    pnl: 4200,
    status: 'active',
  },
  {
    id: 'meanrev',
    name: 'Mean Reversion',
    description: 'Assumes that asset prices will tend to revert to the long-term mean.',
    pnl: -1500,
    status: 'inactive',
  },
  {
    id: 'arbitrage',
    name: 'Arbitrage',
    description: 'Exploits price differences of the same asset on different markets.',
    pnl: 800,
    status: 'active',
  },
  {
    id: 'trendfollow',
    name: 'TrendFollowing',
    description: 'Follows the trend in a market, buying when it goes up, selling when it goes down.',
    pnl: 3100,
    status: 'inactive',
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Lifetime P&L</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategies.map((strategy) => (
                <TableRow key={strategy.id}>
                  <TableCell className="font-medium">{strategy.name}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{strategy.description}</TableCell>
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
