
import pandas as pd
import numpy as np
import importlib.util
from datetime import datetime

def run_backtest(strategy_file_path, data_df, initial_capital=100000, params={}):
    """
    Runs a backtest for a given strategy, data, and parameters.
    """

    # 1. Load Strategy Dynamically
    spec = importlib.util.spec_from_file_location("strategy", strategy_file_path)
    strategy_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(strategy_module)

    # 2. Initialize Context, Portfolio, and Tracking
    class Context:
        pass

    context = Context()
    context.params = params
    context.asset = None # Strategy must set this

    portfolio = {
        'cash': initial_capital,
        'positions': {},
        'total_value': initial_capital
    }
    
    trades = []
    equity_curve = {}

    # --- 3. Define Order Function and other Mocks ---
    def symbol(ticker): return ticker
    strategy_module.symbol = symbol

    def order_target_percent(asset, target_percent):
        current_price = data_df.loc[current_time, 'Close']
        current_value = portfolio['positions'].get(asset, {'shares': 0})['shares'] * current_price
        portfolio_value = portfolio['cash'] + current_value

        target_value = portfolio_value * target_percent
        delta_value = target_value - current_value
        shares_to_trade = delta_value / current_price

        if shares_to_trade != 0:
            # Simulate Trade Execution
            portfolio['cash'] -= shares_to_trade * current_price
            current_shares = portfolio['positions'].get(asset, {'shares': 0})['shares']
            
            # Record the trade
            trade_info = {
                'asset': asset,
                'shares': shares_to_trade,
                'price': current_price,
                'date': current_time,
                'direction': 'BUY' if shares_to_trade > 0 else 'SELL'
            }
            trades.append(trade_info)
            
            # Update position
            new_shares = current_shares + shares_to_trade
            if new_shares > 0:
                portfolio['positions'][asset] = {'shares': new_shares}
            else:
                # If shares are sold, remove from positions
                if asset in portfolio['positions']: del portfolio['positions'][asset]

    strategy_module.order_target_percent = order_target_percent

    # 4. Call Strategy Initialize
    strategy_module.initialize(context)
    
    # 5. Main Backtest Loop
    for index, row in data_df.iterrows():
        global current_time
        current_time = index

        current_data = {
            'history': lambda asset, field, lookback, freq: data_df[field.capitalize()].loc[:index].tail(lookback),
            'current': lambda asset, field: row[field.capitalize()]
        }

        strategy_module.handle_data(context, current_data)
        
        # Update Portfolio Value at the end of the day
        current_price = row['Close']
        total_position_value = sum(pos['shares'] * current_price for asset, pos in portfolio['positions'].items())
        portfolio['total_value'] = portfolio['cash'] + total_position_value
        equity_curve[index] = portfolio['total_value']

    # 6. Calculate Final Metrics
    final_equity = portfolio['total_value']
    total_return_pct = ((final_equity - initial_capital) / initial_capital) * 100
    
    equity_series = pd.Series(equity_curve)
    peak = equity_series.cummax()
    drawdown = (equity_series - peak) / peak
    max_drawdown = drawdown.min()
    
    returns = equity_series.pct_change().dropna()
    sharpe_ratio = (returns.mean() / returns.std()) * np.sqrt(252) if returns.std() > 0 else 0
    
    # --- Trade-based metrics ---
    winning_trades = [t for t in trades if (t['direction'] == 'BUY' and t['shares'] * t['price'] < 0) or (t['direction'] == 'SELL' and t['shares'] * t['price'] > 0)]
    losing_trades = len(trades) - len(winning_trades)
    win_rate = len(winning_trades) / len(trades) * 100 if len(trades) > 0 else 0
    
    return {
        'initial_capital': initial_capital,
        'final_equity': round(final_equity, 2),
        'total_return_pct': round(total_return_pct, 2),
        'sharpe_ratio': round(sharpe_ratio, 2),
        'max_drawdown': round(max_drawdown, 4),
        'equity_curve': {k.strftime('%Y-%m-%d'): v for k, v in equity_curve.items()},
        'total_trades': len(trades),
        'winning_trades': len(winning_trades),
        'losing_trades': losing_trades,
        'win_rate_pct': round(win_rate, 2),
        'trades': trades
    }
