'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const strategyCodeById: Record<string, string> = {
    gridbot: `
import backtrader as bt

class GridBotStrategy(bt.Strategy):
    params = (
        ('grid_levels', 10),
        ('grid_size', 0.01), # 1% grid size
    )

    def __init__(self):
        self.order = None
        self.orders = []
        self.price = self.data.close[0]
        
        for i in range(1, self.p.grid_levels + 1):
            buy_price = self.price * (1 - i * self.p.grid_size)
            sell_price = self.price * (1 + i * self.p.grid_size)
            self.buy(price=buy_price, exectype=bt.Order.Limit)
            self.sell(price=sell_price, exectype=bt.Order.Limit)

    def next(self):
        pass # Logic is handled by limit orders
`,
    momentum: `
import backtrader as bt

class MomentumStrategy(bt.Strategy):
    params = (('momentum_period', 20),)

    def __init__(self):
        self.momentum = bt.indicators.Momentum(self.data.close, period=self.p.momentum_period)

    def next(self):
        if not self.position:
            if self.momentum > 0:
                self.buy()
        else:
            if self.momentum < 0:
                self.sell()
`,
    meanrev: `
import backtrader as bt

class MeanReversionStrategy(bt.Strategy):
    params = (('period', 20),)

    def __init__(self):
        self.sma = bt.indicators.SimpleMovingAverage(self.data.close, period=self.p.period)

    def next(self):
        if not self.position:
            if self.data.close[0] < self.sma[0]:
                self.buy()
        else:
            if self.data.close[0] > self.sma[0]:
                self.sell()
`
};

export default function StrategyDetailPage({ params }: { params: { id: string } }) {
  const strategyId = params.id;
  const initialCode = strategyCodeById[strategyId] || 'Strategy code not found.';
  const [code, setCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
        title: 'Copied to Clipboard',
        description: 'Strategy code has been copied.',
      });
  }

  const handleSave = () => {
      setIsLoading(true);
      // Simulate saving the code
      setTimeout(() => {
        setIsLoading(false);
        toast({
            title: 'Strategy Saved',
            description: 'Your changes have been saved.',
        });
      }, 1000);
  }

  return (
    <div className="grid flex-1 gap-4 md:gap-8">
       <div className="flex items-center gap-4">
        <Link href="/strategies">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 capitalize">
          {strategyId.replace(/([A-Z])/g, ' $1')} Strategy
        </h1>
         <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Strategy Code</CardTitle>
                <CardDescription>
                    Edit the Python code for your strategy below.
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy</span>
            </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg overflow-x-auto h-[500px]">
            <textarea
              className="w-full h-full bg-transparent text-sm font-code resize-none border-none focus:outline-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
