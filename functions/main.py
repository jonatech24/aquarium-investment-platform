
import pandas as pd
from backtest_engine import run_backtest
import json

# --- Configuration ---
# In a real app, these would come from the web request (e.g., from a POST body)
STRATEGY_FILE = 'functions/strategies/supertrend_adx_strategy.py'
DATA_FILE = 'functions/data.csv'
INITIAL_CAPITAL = 100000
STRATEGY_PARAMS = {
    'asset': 'SPY',
    'supertrend_period': 12, # Example of overriding the default of 10
    'supertrend_multiplier': 3,
    'adx_period': 14,
    'adx_threshold': 25
}

# --- Main Execution Block ---
def main():
    """
    Main function to orchestrate the backtest.
    """
    # 1. Load Data
    # We parse the 'Date' column as dates and set it as the index, which is crucial for time series operations.
    try:
        market_data = pd.read_csv(DATA_FILE, parse_dates=['Date'], index_col='Date')
    except FileNotFoundError:
        print(json.dumps({'error': f"Data file not found at {DATA_FILE}"}))
        return

    # 2. Run the Backtest by calling the engine
    backtest_results = run_backtest(
        strategy_file_path=STRATEGY_FILE,
        data_df=market_data,
        initial_capital=INITIAL_CAPITAL,
        params=STRATEGY_PARAMS
    )

    # 3. Print JSON results
    # The output is a JSON string that the Next.js frontend can parse and display.
    # We handle potential serialization issues with complex types like Timestamps.
    def default_serializer(o):
        if isinstance(o, (pd.Timestamp, pd.NaT)):
            return o.isoformat()
        raise TypeError(f"Object of type {o.__class__.__name__} is not JSON serializable")

    print(json.dumps(backtest_results, indent=2, default=default_serializer))

if __name__ == "__main__":
    main()
