from backtesting import Backtest
import pandas as pd

def run_backtest(data: pd.DataFrame, strategy_module, initial_capital: float, params: dict):
    """
    Runs a backtest using the backtesting.py library.
    """
    if not hasattr(strategy_module, 'TradingStrategy'):
        raise AttributeError("Strategy module must have a class named 'TradingStrategy'")

    StrategyClass = strategy_module.TradingStrategy

    # The library expects the data, the strategy CLASS, and keyword arguments for cash etc.
    bt = Backtest(data, StrategyClass, cash=initial_capital, commission=.002)

    # The `run` method is where strategy-specific parameters are passed.
    stats = bt.run(**params)

    # The output `stats` is a pandas Series. We will convert it and the underlying
    # trades and equity curve into a JSON-serializable dictionary.
    
    summary_dict = stats.to_dict()
    
    # Clean up non-serializable types from the summary
    for key, value in summary_dict.items():
        if isinstance(value, (pd.Timestamp, pd.Timedelta)):
            summary_dict[key] = str(value)
        elif pd.isna(value):
            summary_dict[key] = None

    results = {
        "summary": summary_dict,
        "trades": stats._trades.to_dict(orient='records'),
        "equity_curve": {d.isoformat(): v for d, v in stats._equity_curve['Equity'].items()}
    }

    return results
