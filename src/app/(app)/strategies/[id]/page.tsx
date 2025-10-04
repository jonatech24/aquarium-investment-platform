'use client';

import { useState, useEffect } from 'react';
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
    gapandgo: `
import backtrader as bt

class GapAndGoStrategy(bt.Strategy):
    params = (
        ('gap_threshold', 0.02),  # 2% gap
    )

    def __init__(self):
        self.opening_price = None

    def prenext(self):
        # Store opening price on the first bar of the day
        if not self.opening_price or self.data.datetime.date(0) != self.data.datetime.date(-1):
            self.opening_price = self.data.open[0]

    def next(self):
        # Check for gap up on the first bar of the day
        if self.data.open[0] > self.data.close[-1] * (1 + self.p.gap_threshold):
            if not self.position:
                self.buy() # Enter long position

        # Exit position after a few bars (e.g., 60 minutes)
        if self.position and len(self) > (self.bar_executed + 60):
            self.sell()
`,
    trendfollowing: `
import backtrader as bt

class TrendFollowingStrategy(bt.Strategy):
    params = (
        ('fast_ma', 50),
        ('slow_ma', 200),
    )

    def __init__(self):
        self.fast_ma = bt.indicators.SimpleMovingAverage(self.data.close, period=self.p.fast_ma)
        self.slow_ma = bt.indicators.SimpleMovingAverage(self.data.close, period=self.p.slow_ma)
        self.crossover = bt.indicators.CrossOver(self.fast_ma, self.slow_ma)

    def next(self):
        if not self.position:
            if self.crossover > 0: # Fast MA crosses above Slow MA
                self.buy()
        elif self.crossover < 0: # Fast MA crosses below Slow MA
            self.close()
`,
    meanreversion: `
import backtrader as bt

class MeanReversionStrategy(bt.Strategy):
    params = (
        ('period', 20),
        ('devfactor', 2.0),
    )

    def __init__(self):
        self.bollinger = bt.indicators.BollingerBands(self.data.close, period=self.p.period, devfactor=self.p.devfactor)

    def next(self):
        if not self.position:
            if self.data.close[0] < self.bollinger.lines.bot[0]: # Price touches lower band
                self.buy()
        else:
            if self.data.close[0] > self.bollinger.lines.mid[0]: # Price crosses above middle band
                self.sell()
`,
    momentum: `
import backtrader as bt

class MomentumStrategy(bt.Strategy):
    params = (('period', 14),)

    def __init__(self):
        self.roc = bt.indicators.RateOfChange(self.data.close, period=self.p.period)

    def next(self):
        if not self.position:
            if self.roc[0] > 0: # Positive momentum
                self.buy()
        else:
            if self.roc[0] < 0: # Negative momentum
                self.sell()
`,
    arbitrage: `
import backtrader as bt

class ArbitrageStrategy(bt.Strategy):
    # NOTE: This requires multiple data feeds (e.g., data0 and data1)
    # representing the same asset on different exchanges.

    def __init__(self):
        self.spread = self.data0.close - self.data1.close

    def next(self):
        if not self.position:
            if self.spread[0] > 2.0: # Arbitrage opportunity
                self.sell(data=self.data0)
                self.buy(data=self.data1)
        else:
            if self.spread[0] < 0.5: # Opportunity closes
                self.close(data=self.data0)
                self.close(data=self.data1)
`
};

export default function StrategyDetailPage({ params }: { params: { id: string } }) {
  const strategyId = params.id;
  const initialCode = strategyCodeById[strategyId] || 'Strategy code not found.';
  const [code, setCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [backendMessage, setBackendMessage] = useState('Loading message from backend...');
  const { toast } = useToast();

  useEffect(() => {
    // !!! IMPORTANT: REPLACE THIS URL !!!
    const functionUrl = 'https://run_strategy-YOUR_PROJECT_ID.cloudfunctions.net/run_strategy';

    fetch(functionUrl)
      .then(response => response.text())
      .then(text => {
        setBackendMessage(text);
        toast({
            title: 'Backend Connected',
            description: 'Successfully received message from the backend.',
        });
      })
      .catch(error => {
        console.error("Error fetching from backend:", error);
        setBackendMessage('Failed to connect to backend. Check console for details.');
        toast({
            title: 'Backend Connection Failed',
            description: 'Please update the functionUrl in the code.',
            variant: 'destructive',
        });
      });
  }, []); // Empty dependency array means this runs once on component mount

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
        <CardHeader>
          <CardTitle>Backend Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{backendMessage}</p>
        </CardContent>
      </Card>
      
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
