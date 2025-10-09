import functions_framework
from firebase_admin import initialize_app
from firebase_functions import options, https_fn
import pandas as pd
import yfinance as yf
import importlib.util
import sys
import json
from datetime import datetime
import re

from backtest_engine import run_backtest

# Initialize Firebase (if not already done)
try:
    initialize_app()
except ValueError:
    pass

# Define CORS options to allow requests from your frontend
cors_options = options.CorsOptions(
    cors_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:8081",
        "https://*.web.app",
        "https://*.firebaseapp.com",
        "https://aquarium-investment-platform-studio-2799607830-e7b65.us-east4.hosted.app",
        "https://9000-firebase-studio-1759333957868.cluster-f73ibkkuije66wssuontdtbx6q.cloudworkstations.dev",
    ],
    cors_methods=["post"],
)

def load_strategy_module(strategy_id):
    """Dynamically loads a strategy module from the 'strategies' directory."""
    if not re.match(r'^[a-zA-Z0-9_]+$', strategy_id):
        raise ValueError(f"Invalid characters in strategy ID: {strategy_id}")

    module_name = f"strategies.{strategy_id}"
    file_path = f"./strategies/{strategy_id}.py"

    if module_name in sys.modules:
        # If module is already loaded, reload it to pick up any changes
        importlib.reload(sys.modules[module_name])
        return sys.modules[module_name]

    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None:
        raise ImportError(f"Could not load spec for module {module_name} at {file_path}")
    
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    
    return module

@https_fn.on_request(cors=cors_options)
def runbacktest(req: https_fn.Request) -> https_fn.Response:
    """An HTTPS Cloud Function to run a trading backtest."""
    if req.method != 'POST':
        return https_fn.Response("Only POST requests are accepted.", status=405)

    try:
        # The frontend now sends a JSON body, so we use req.get_json()
        req_body = req.get_json()
        
        # General parameters
        strategy_id = req_body.get('strategy')
        if not strategy_id:
            raise ValueError("Strategy ID is missing from the request.")

        initial_capital = float(req_body.get('cash', 100000))
        
        # Parameters are now a direct dictionary in the JSON body
        strategy_params = req_body.get('params', {})

        # Data source parameters
        data_source = req_body.get('dataSource', 'yahoo')
        timeframe = req_body.get('timeframe')
        ticker = req_body.get('ticker')
        start_date = req_body.get('startDate')
        end_date = req_body.get('endDate')
        
        data = None

        if data_source == 'yahoo':
            if not all([ticker, start_date, end_date, timeframe]):
                raise ValueError("Ticker, Start Date, End Date, and Timeframe are required for Yahoo Finance.")
            data = yf.download(ticker, start=start_date, end=end_date, interval=timeframe)
        
        # NOTE: Add elif blocks for 'alpaca', 'polygon', etc. here when you implement them
        
        else:
            raise ValueError(f"Unsupported data source: {data_source}")
            
        if data is None or data.empty:
            raise ValueError("Could not load market data. Please check ticker and date range.")

        # --- Run the Backtest ---
        strategy_module = load_strategy_module(strategy_id)
            
        results = run_backtest(
            data=data,
            strategy_module=strategy_module,
            initial_capital=initial_capital,
            params=strategy_params
        )

        # The 'results' object from the backtesting library is a pandas Series/Object.
        # It MUST be converted to a JSON string before sending.
        # orient='split' is a good format for pandas DataFrames/Series.
        results_json = results.to_json(orient='split', date_format='iso')

        # We return the JSON string directly. The client will parse it.
        return https_fn.Response(results_json, status=200, mimetype="application/json")

    except Exception as e:
        import traceback
        error_message = f"An error occurred in the backend: {e}"
        print(error_message)
        print(traceback.format_exc())
        return https_fn.Response(
            json.dumps({"error": error_message}),
            status=400, # Use 400 for client-side errors, 500 for internal server errors
            mimetype="application/json"
        )
