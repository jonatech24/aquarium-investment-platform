from backtesting import Backtest
import pandas as pd

def run_backtest(data: pd.DataFrame, strategy_module, initial_capital: float, params: dict):
    """
    Runs a backtest using the backtesting.py library.
    """
    if not hasattr(strategy_module, 'TradingStrategy'):
        raise AttributeError("Strategy module must have a class named 'TradingStrategy'")

    StrategyClass = strategy_module.TradingStrategy

    # THE FIX - Part 1: Add `finalize_trades=True` to prevent open trades at the end and fix warnings.
    bt = Backtest(data, StrategyClass, cash=initial_capital, commission=.002, trade_on_close=True, finalize_trades=True)

    stats = bt.run(**params)

    # THE FIX - Part 2: Correctly process the results object.
    # The `stats` Series contains scalar values for the summary, but also complex objects
    # like `_trades` and `_equity_curve` (DataFrames). We must handle them separately.
    
    # 1. Create a clean summary dictionary with only scalar values.
    summary_dict = {}
    for key, value in stats.items():
        # Filter out the complex objects, which are handled next.
        if key.startswith('_'):
            continue
        
        if isinstance(value, (pd.Timestamp, pd.Timedelta)):
            summary_dict[key] = str(value)
        elif pd.isna(value):
            summary_dict[key] = None
        else:
            summary_dict[key] = value

    # 2. Build the final results object, correctly processing the DataFrames.
    results = {
        "summary": summary_dict,
        "trades": stats['_trades'].to_dict(orient='records'),
        "equity_curve": {d.isoformat(): v for d, v in stats['_equity_curve']['Equity'].items()}
    }

    return results
