
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
import time
from flask import Response, stream_with_context

from backtest_engine import run_backtest

# --- Initialization ---
try:
    initialize_app()
except ValueError:
    pass

cors_options = options.CorsOptions(
    cors_origins=["*"],
    cors_methods=["POST", "OPTIONS"],
)

# --- Helper Functions ---
def load_strategy_module(strategy_id):
    if not re.match(r'^[a-zA-Z0-9_]+$', strategy_id):
        raise ValueError(f"Invalid characters in strategy ID: {strategy_id}")
    module_name = f"strategies.{strategy_id}"
    file_path = f"./strategies/{strategy_id}.py"
    if module_name in sys.modules:
        importlib.reload(sys.modules[module_name])
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None:
        raise ImportError(f"Could not load spec for module {module_name} at {file_path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module

def _run_and_stream(req_body):
    """Generator function to stream backtest progress."""
    
    # 1. Validate Parameters
    yield json.dumps({"step": 0, "status": "in-progress", "name": "Validating Parameters"}) + '\n'
    time.sleep(0.5) # Simulate work

    strategy_id = req_body.get('strategy')
    data_source = req_body.get('dataSource', 'yahoo')
    ticker = req_body.get('ticker')
    start_date = req_body.get('startDate')
    end_date = req_body.get('endDate')
    timeframe = req_body.get('timeframe')
    
    try:
        if not all([strategy_id, data_source, ticker, start_date, end_date, timeframe]):
            raise ValueError("One or more required parameters are missing.")
        
        strategy_module = load_strategy_module(strategy_id)
        initial_capital = float(req_body.get('cash', 100000))

        yield json.dumps({"step": 0, "status": "success", "name": "Parameters Validated"}) + '\n'

        # 2. Connect and Fetch Data
        yield json.dumps({"step": 1, "status": "in-progress", "name": f"Connecting to {data_source.capitalize()} for {ticker}..."}) + '\n'
        time.sleep(0.5) # Simulate connection
        
        yield json.dumps({"step": 1, "status": "in-progress", "name": f"Downloading {ticker} data..."}) + '\n'
        data = yf.download(ticker, start=start_date, end=end_date, interval=timeframe)
        if data.empty:
            raise ValueError(f"No data returned for ticker '{ticker}'. Check ticker and date range.")
            
        yield json.dumps({"step": 1, "status": "success", "name": "Market Data Fetched"}) + '\n'

        # 3. Run Backtest/Optimization
        mode = req_body.get('mode', 'single')
        run_name = "Running Backtest" if mode == 'single' else "Running Optimization"
        yield json.dumps({"step": 2, "status": "in-progress", "name": run_name}) + '\n'

        # --- This is where the main computation happens ---
        if mode == 'single':
            params = req_body.get('params', {})
            results = run_backtest(data, strategy_module, initial_capital, params)
        else: # Optimization
            time.sleep(5) # Simulate a longer optimization run
            params = req_body.get('params', {}) 
            results = run_backtest(data, strategy_module, initial_capital, params)


        yield json.dumps({"step": 2, "status": "success", "name": "Calculation Complete"}) + '\n'
        
        # 4. Finalizing and Presenting Results
        yield json.dumps({"step": 3, "status": "in-progress", "name": "Presenting Results"}) + '\n'
        time.sleep(0.5)

        # Send the final, complete results payload
        yield json.dumps({"step": 3, "status": "success", "name": "Done", "results": results}) + '\n'

    except Exception as e:
        import traceback
        error_message = f"An error occurred: {e}"
        print(error_message)
        print(traceback.format_exc())
        yield json.dumps({"status": "error", "message": error_message}) + '\n'


@https_fn.on_request(cors=cors_options)
def runbacktest(req: https_fn.Request) -> Response:
    """An HTTPS Cloud Function that streams the backtest process."""
    if req.method == 'OPTIONS':
        # Send response to preflight request.
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600',
        }
        return Response(status=204, headers=headers)

    if req.method != 'POST':
        return Response("Only POST requests are accepted.", status=405)

    req_body = req.get_json()
    
    # Use Flask's Response with stream_with_context to handle the generator
    return Response(stream_with_context(_run_and_stream(req_body)),
                    mimetype='application/x-ndjson')
