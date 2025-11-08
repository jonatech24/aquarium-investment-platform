
from backtesting import Strategy
from backtesting.lib import crossover
import pandas as pd

# --- Indicator Calculation Functions ---
# The key change is to explicitly pass the data's index and use it when creating any pandas Series.
# This ensures that the final indicator Series has the correct DatetimeIndex to align with the price data.

def _calculate_atr(index, high, low, close, period):
    high_s = pd.Series(high, index=index)
    low_s = pd.Series(low, index=index)
    close_s = pd.Series(close, index=index)
    
    tr1 = high_s - low_s
    tr2 = abs(high_s - close_s.shift(1))
    tr3 = abs(low_s - close_s.shift(1))
    
    tr = pd.DataFrame({'tr1': tr1, 'tr2': tr2, 'tr3': tr3}).max(axis=1)
    return tr.rolling(window=period).mean()

def supertrend_indicator(index, high, low, close, period, multiplier):
    atr = _calculate_atr(index, high, low, close, period).bfill()
    
    high_s = pd.Series(high, index=index)
    low_s = pd.Series(low, index=index)
    close_s = pd.Series(close, index=index)

    hl2 = (high_s + low_s) / 2
    upper_band = hl2 + (multiplier * atr)
    lower_band = hl2 - (multiplier * atr)
    
    supertrend_series = pd.Series(index=close_s.index, dtype=float)
    direction = pd.Series(index=close_s.index, dtype=int)
    direction.iloc[0] = 1

    for i in range(1, len(close_s)):
        if close_s.iloc[i-1] <= upper_band.iloc[i-1]:
            upper_band.iloc[i] = min(upper_band.iloc[i], upper_band.iloc[i-1])
        if close_s.iloc[i-1] >= lower_band.iloc[i-1]:
            lower_band.iloc[i] = max(lower_band.iloc[i], lower_band.iloc[i-1])
        
        if direction.iloc[i-1] == 1 and close_s.iloc[i] <= lower_band.iloc[i]:
            direction.iloc[i] = -1
        elif direction.iloc[i-1] == -1 and close_s.iloc[i] >= upper_band.iloc[i]:
            direction.iloc[i] = 1
        else:
            direction.iloc[i] = direction.iloc[i-1]
            
        supertrend_series.iloc[i] = lower_band.iloc[i] if direction.iloc[i] == 1 else upper_band.iloc[i]
        
    return supertrend_series.bfill()

def adx_indicator(index, high, low, close, period):
    atr = _calculate_atr(index, high, low, close, period).bfill()

    high_s = pd.Series(high, index=index)
    low_s = pd.Series(low, index=index)
    
    plus_dm = high_s.diff().fillna(0)
    minus_dm = low_s.diff().fillna(0) * -1
    plus_dm[plus_dm < 0] = 0
    minus_dm[minus_dm < 0] = 0
    
    plus_di = 100 * (plus_dm.ewm(span=period, adjust=False).mean() / atr)
    minus_di = 100 * (minus_dm.ewm(span=period, adjust=False).mean() / atr)
    
    dx = (abs(plus_di - minus_di) / (plus_di + minus_di).replace(0, 1)) * 100
    adx = dx.ewm(span=period, adjust=False).mean()
    return adx.bfill()

# --- Strategy Class ---
class TradingStrategy(Strategy):
    supertrend_period = 10
    supertrend_multiplier = 3
    adx_period = 14
    adx_threshold = 25

    def init(self):
        self.st = self.I(supertrend_indicator, self.data.index, self.data.High, self.data.Low, self.data.Close, self.supertrend_period, self.supertrend_multiplier)
        self.adx = self.I(adx_indicator, self.data.index, self.data.High, self.data.Low, self.data.Close, self.adx_period)

    def next(self):
        is_strong_trend = self.adx[-1] > self.adx_threshold

        # THE FIX: Call `crossover` directly within the `if` statement.
        # This allows the backtesting library to correctly interpret the condition for the current time step.
        if crossover(self.data.Close, self.st) and is_strong_trend and not self.position:
            self.buy()

        elif crossover(self.st, self.data.Close) and is_strong_trend and self.position:
            self.sell()
