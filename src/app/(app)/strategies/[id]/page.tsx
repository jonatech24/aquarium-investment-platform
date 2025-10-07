// This is the Server Component, responsible for static generation
import StrategyDetailClient from './strategy-detail-client';
import { strategies } from '@/lib/strategies'; // Import the single source of truth

// This object holds the actual Python code snippets for DISPLAY on the frontend.
// It should only contain entries for strategies that have a corresponding, fully implemented
// Python file in the `functions/strategies` directory.
const strategyCodeById: Record<string, string> = {
    trend_following: `
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
    // IMPORTANT: As you implement new strategies in the backend (e.g., functions/strategies/mean_reversion.py),
    // you will add their code here. For example:
    // mean_reversion: `
    // import backtrader as bt
    // class MeanReversionStrategy(bt.Strategy):
    //     ...
    // `
};

// This function tells Next.js which dynamic pages to build based on our master list.
export async function generateStaticParams() {
  return strategies.map((strategy) => ({
    id: strategy.id,
  }));
}

// This component fetches the correct code and renders the client part.
export default function StrategyDetailPage({ params }: { params: any }) {
  const { id } = params as { id: string };

  // Look up the code snippet from our object. If not found, display a clear message.
  const initialCode = strategyCodeById[id] || '// Strategy code not yet implemented.';

  // Render the client component, passing the data it needs.
  return <StrategyDetailClient strategyId={id} initialCode={initialCode} />;
}
