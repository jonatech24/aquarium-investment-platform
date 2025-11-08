
from backtesting import Strategy
import pandas as pd

# This is the simplest possible custom indicator.
# It takes the index and close price, and returns a 10-period simple moving average.
def sma_indicator(index, close_price, period=10):
    close_series = pd.Series(close_price, index=index)
    return close_series.rolling(window=period).mean()

class TradingStrategy(Strategy):
    """
    A minimal test strategy. If this works, the problem is in the complex
    indicator calculations of the other file. If this fails, the problem
    is in the core backtesting setup.
    """
    def init(self):
        # We call self.I() to register our custom indicator.
        self.sma = self.I(sma_indicator, self.data.index, self.data.Close, 10)

    def next(self):
        # No trading logic needed for this test.
        pass
