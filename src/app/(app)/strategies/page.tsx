
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
import { strategies } from '@/lib/strategies';

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
