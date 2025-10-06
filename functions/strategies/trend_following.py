import pandas as pd
import numpy as np

# --- Indicator Helper Functions (Adapted from your script) ---

def calculate_atr(high, low, close, period=14):
    """Calculates the Average True Range (ATR)"""
    tr1 = high - low
    tr2 = abs(high - close.shift(1))
    tr3 = abs(low - close.shift(1))
    tr = pd.DataFrame({'tr1': tr1, 'tr2': tr2, 'tr3': tr3}).max(axis=1)
    atr = tr.rolling(window=period).mean()
    return atr

def supertrend(df, period=10, multiplier=3):
    """Calculates the SuperTrend indicator"""
    high = df['High']
    low = df['Low']
    close = df['Close']
    
    atr = calculate_atr(high, low, close, period)
    
    hl2 = (high + low) / 2
    upper_band = hl2 + (multiplier * atr)
    lower_band = hl2 - (multiplier * atr)
    
    supertrend_series = pd.Series(index=df.index, dtype=float)
    direction = pd.Series(index=df.index, dtype=int)
    
    direction.iloc[0] = 1
    
    for i in range(1, len(df)):
        if close.iloc[i-1] <= upper_band.iloc[i-1]:
            upper_band.iloc[i] = min(upper_band.iloc[i], upper_band.iloc[i-1])
        
        if close.iloc[i-1] >= lower_band.iloc[i-1]:
            lower_band.iloc[i] = max(lower_band.iloc[i], lower_band.iloc[i-1])

        if direction.iloc[i-1] == 1 and close.iloc[i] <= lower_band.iloc[i]:
            direction.iloc[i] = -1
        elif direction.iloc[i-1] == -1 and close.iloc[i] >= upper_band.iloc[i]:
            direction.iloc[i] = 1
        else:
            direction.iloc[i] = direction.iloc[i-1]
        
        if direction.iloc[i] == 1:
            supertrend_series.iloc[i] = lower_band.iloc[i]
        else:
            supertrend_series.iloc[i] = upper_band.iloc[i]
            
    return supertrend_series, direction

def calculate_adx(df, period=14):
    """Calculates the Average Directional Index (ADX)"""
    high = df['High']
    low = df['Low']
    close = df['Close']
    
    tr = calculate_atr(high, low, close, period)
    plus_dm = high.diff()
    minus_dm = low.diff() * -1
    plus_dm[plus_dm < 0] = 0
    minus_dm[minus_dm < 0] = 0
    
    plus_di = 100 * (plus_dm.ewm(span=period, adjust=False).mean() / tr)
    minus_di = 100 * (minus_dm.ewm(span=period, adjust=False).mean() / tr)
    
    dx = (abs(plus_di - minus_di) / abs(plus_di + minus_di)) * 100
    adx = dx.ewm(span=period, adjust=False).mean()
    return adx

# --- Strategy Implementation ---

def initialize(context):
    """
    Called once at the start of the algorithm to set up the strategy.
    """
    default_params = {
        'asset': 'SPY',
        'supertrend_period': 10,
        'supertrend_multiplier': 3,
        'adx_period': 14,
        'adx_threshold': 25
    }
    user_params = getattr(context, 'params', {})
    final_params = {**default_params, **user_params}

    context.asset = symbol(final_params['asset'])
    context.supertrend_period = final_params['supertrend_period']
    context.supertrend_multiplier = final_params['supertrend_multiplier']
    context.adx_period = final_params['adx_period']
    context.adx_threshold = final_params['adx_threshold']

    context.in_position = False

def handle_data(context, data):
    """
    Called for each trading bar. The main logic of the strategy is here.
    """
    history_window = context.adx_period * 2 

    # Get historical data required for indicators
    hist_close = data.history(context.asset, 'price', history_window, '1d')
    hist_high = data.history(context.asset, 'high', history_window, '1d')
    hist_low = data.history(context.asset, 'low', history_window, '1d')
    
    # Combine into a single DataFrame
    hist_df = pd.DataFrame({'High': hist_high, 'Low': hist_low, 'Close': hist_close})
    hist_df.dropna(inplace=True)

    if len(hist_df) < max(context.supertrend_period, context.adx_period):
        return # Not enough data to compute indicators

    # Calculate indicators
    hist_df['SuperTrend'], hist_df['Direction'] = supertrend(hist_df, context.supertrend_period, context.supertrend_multiplier)
    hist_df['ADX'] = calculate_adx(hist_df, context.adx_period)

    # Avoid errors on the first few bars where indicators might be NaN
    hist_df.dropna(inplace=True)
    if len(hist_df) < 2:
        return

    # Get the last two bars for crossover signal detection
    last_bar = hist_df.iloc[-1]
    prev_bar = hist_df.iloc[-2]

    # --- Trading Logic ---
    is_strong_trend = last_bar['ADX'] > context.adx_threshold
    
    # Buy Signal: Price crosses above SuperTrend in a strong trend
    buy_signal = (prev_bar['Close'] <= prev_bar['SuperTrend'] and 
                  last_bar['Close'] > last_bar['SuperTrend'] and
                  is_strong_trend)

    # Sell Signal: Price crosses below SuperTrend in a strong trend
    sell_signal = (prev_bar['Close'] >= prev_bar['SuperTrend'] and 
                   last_bar['Close'] < last_bar['SuperTrend'] and
                   is_strong_trend)

    if buy_signal and not context.in_position:
        order_target_percent(context.asset, 1.0)
        context.in_position = True
        print(f"BUY signal at {last_bar['Close']}. Entering position.")

    elif sell_signal and context.in_position:
        order_target_percent(context.asset, 0.0)
        context.in_position = False
        print(f"SELL signal at {last_bar['Close']}. Exiting position.")
