// This is the Server Component, responsible for static generation
import StrategyDetailClient from './strategy-detail-client';

// Define the shape of the props that Next.js will pass to the page
// type Props = {
//   params: { id: string };
//   searchParams: { [key: string]: string | string[] | undefined };
// };

const strategyCodeById: Record<string, string> = {
    gapandgo: `
import backtrader as bt

class GapAndGoStrategy(bt.Strategy):
    params = (
        ('gap_threshold', 0.02),  // 2% gap
    )

    def __init__(self):
        self.opening_price = None

    def prenext(self):
        // Store opening price on the first bar of the day
        if not self.opening_price or self.data.datetime.date(0) != self.data.datetime.date(-1):
            self.opening_price = self.data.open[0]

    def next(self):
        // Check for gap up on the first bar of the day
        if self.data.open[0] > self.data.close[-1] * (1 + self.p.gap_threshold):
            if not self.position:
                self.buy() // Enter long position

        // Exit position after a few bars (e.g., 60 minutes)
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
            if self.crossover > 0: // Fast MA crosses above Slow MA
                self.buy()
        elif self.crossover < 0: // Fast MA crosses below Slow MA
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
            if self.data.close[0] < self.bollinger.lines.bot[0]: // Price touches lower band
                self.buy()
        else:
            if self.data.close[0] > self.bollinger.lines.mid[0]: // Price crosses above middle band
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
            if self.roc[0] > 0: // Positive momentum
                self.buy()
        else:
            if self.roc[0] < 0: // Negative momentum
                self.sell()
`,
    arbitrage: `
import backtrader as bt

class ArbitrageStrategy(bt.Strategy):
    // NOTE: This requires multiple data feeds (e.g., data0 and data1)
    // representing the same asset on different exchanges.

    def __init__(self):
        self.spread = self.data0.close - self.data1.close

    def next(self):
        if not self.position:
            if self.spread[0] > 2.0: // Arbitrage opportunity
                self.sell(data=self.data0)
                self.buy(data=self.data1)
        else:
            if self.spread[0] < 0.5: // Opportunity closes
                self.close(data=self.data0)
                self.close(data=self.data1)
`
};

// This function tells Next.js which dynamic pages to build
export async function generateStaticParams() {
  const strategyIds = Object.keys(strategyCodeById);
  return strategyIds.map((id) => ({
    id: id,
  }));
}

// Apply the defined Props type to the component
export default function StrategyDetailPage({ params }: { params: any }) {
  const { id } = params as { id: string }; // Cast for safety inside the component

  const initialCode = strategyCodeById[id] || 'Strategy code not found.';

  // Render the client component, passing the data it needs
  return <StrategyDetailClient strategyId={id} initialCode={initialCode} />;
}
