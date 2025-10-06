
import functions_framework
from firebase_admin import initialize_app
from firebase_functions import options, https_fn
import pandas as pd
import yfinance as yf
from werkzeug.datastructures import FileStorage
import importlib.util
import sys

from backtest_engine import run_backtest

# Initialize Firebase (if not already done)
try:
    initialize_app()
except ValueError:
    pass

# Set CORS options to allow requests from your app's domain
options.set_global_options(
    cors=options.CorsOptions(
        cors_origins=[
            "http://localhost:3000", # Local dev
            "https://*.web.app", # Your deployed Firebase app
            "https://*.firebaseapp.com",
        ],
        cors_methods=["post"],
    )
)

def load_strategy_module(strategy_id):
    """Dynamically loads a strategy module from the 'strategies' directory."""
    # Sanitize the strategy_id to prevent directory traversal
    if not strategy_id.isalnum() and '_' not in strategy_id:
        raise ValueError(f"Invalid strategy ID: {strategy_id}")

    module_name = f"strategies.{strategy_id}"
    file_path = f"./strategies/{strategy_id}.py"

    # Check if the module is already imported
    if module_name in sys.modules:
        return sys.modules[module_name]

    # If not, import it dynamically
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None:
        raise ImportError(f"Could not load spec for module {module_name} at {file_path}")
    
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    
    return module

@https_fn.on_request()
def runbacktest(req: https_fn.Request) -> https_fn.Response:
    """
    An HTTPS Cloud Function to run a trading backtest.
    """
    if req.method != 'POST':
        return https_fn.Response("Only POST requests are accepted.", status=405)

    # --- Extract parameters from the request ---
    try:
        req_body = req.form.to_dict()
        
        # General parameters
        strategy_id = req_body.get('strategy')
        if not strategy_id:
            raise ValueError("Strategy ID is missing.")

        initial_capital = float(req_body.get('capital', 100000))
        
        # Strategy-specific parameters
        strategy_params = {}
        for key, value in req_body.items():
            if key.startswith('param_'):
                param_name = key.replace('param_', '')
                # Attempt to convert to float, fallback to string if it fails
                try:
                    strategy_params[param_name] = float(value)
                except (ValueError, TypeError):
                    strategy_params[param_name] = value

        # Data source parameters
        data_source = req_body.get('dataSource', 'yahoo')
        
        # --- Load Data based on the selected source ---
        data = None
        if data_source == 'csv':
            if 'csv_file' not in req.files:
                raise ValueError("CSV file is missing.")
            csv_file: FileStorage = req.files['csv_file']
            data = pd.read_csv(csv_file.stream, parse_dates=['Date'])
            data.set_index('Date', inplace=True)

        elif data_source == 'yahoo':
            ticker = req_body.get('ticker')
            start_date = req_body.get('startDate')
            end_date = req_body.get('endDate')
            if not all([ticker, start_date, end_date]):
                raise ValueError("Ticker, Start Date, and End Date are required for Yahoo Finance.")
            
            data = yf.download(ticker, start=start_date, end=end_date)
            # yfinance returns index as Datetime, which is what the engine expects
            # data.reset_index(inplace=True)

        # TODO: Add Polygon.io data source logic here in the future
        
        else:
            raise ValueError(f"Unsupported data source: {data_source}")
            
        if data is None or data.empty:
            raise ValueError("Could not load data. Please check your inputs.")

        # --- Run the Backtest ---
        strategy_module = load_strategy_module(strategy_id)
            
        results = run_backtest(
            data=data,
            strategy_module=strategy_module,
            initial_capital=initial_capital,
            params=strategy_params
        )

        return https_fn.Response(results, status=200, mimetype="application/json")

    except Exception as e:
        import traceback
        print(f"Error running backtest: {e}")
        print(traceback.format_exc())
        # Return a structured error to the client
        return https_fn.Response(
            {"error": str(e)},
            status=400,
            mimetype="application/json"
        )
