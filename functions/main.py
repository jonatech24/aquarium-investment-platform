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
    cors_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:8081",
        "https://*.web.app",
        "https://*.firebaseapp.com",
        "https://aquarium-investment-platform-studio-2799607830-e7b65.us-east4.hosted.app",
        "https://9000-firebase-studio-1759333957868.cluster-f73ibkkuije66wssuontdtbx6q.cloudworkstations.dev",
    ],
    cors_methods=["POST"],
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
    yield json.dumps({"step": 0, "status": "in-progress", "name": "Validating Parameters"})
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

        yield json.dumps({"step": 0, "status": "success", "name": "Parameters Validated"})

        # 2. Connect and Fetch Data
        yield json.dumps({"step": 1, "status": "in-progress", "name": f"Fetching {ticker} Data..."})
        time.sleep(1) # Simulate connection

        data = yf.download(ticker, start=start_date, end=end_date, interval=timeframe)
        if data.empty:
            raise ValueError(f"No data returned for ticker '{ticker}'. Check ticker and date range.")
            
        yield json.dumps({"step": 1, "status": "success", "name": "Market Data Fetched"})

        # 3. Run Backtest/Optimization
        mode = req_body.get('mode', 'single')
        run_name = "Running Backtest" if mode == 'single' else "Running Optimization"
        yield json.dumps({"step": 2, "status": "in-progress", "name": run_name})

        # --- This is where the main computation happens ---
        if mode == 'single':
            params = req_body.get('params', {})
            results = run_backtest(data, strategy_module, initial_capital, params)
        else: # Optimization
            # Note: This is a placeholder for the actual optimization logic
            # The real implementation would go here.
            # For now, we'll just run a single backtest as a demo.
            time.sleep(5) # Simulate a longer optimization run
            params = req_body.get('params', {}) # Using single params for demo
            results = run_backtest(data, strategy_module, initial_capital, params)


        yield json.dumps({"step": 2, "status": "success", "name": "Calculation Complete"})
        
        # 4. Finalizing and Presenting Results
        yield json.dumps({"step": 3, "status": "in-progress", "name": "Presenting Results"})
        time.sleep(0.5)

        # Send the final, complete results payload
        yield json.dumps({"step": 3, "status": "success", "name": "Done", "results": results})

    except Exception as e:
        import traceback
        error_message = f"An error occurred: {e}"
        print(error_message)
        print(traceback.format_exc())
        yield json.dumps({"status": "error", "message": error_message})


@https_fn.on_request(cors=cors_options)
def runbacktest(req: https_fn.Request) -> Response:
    """An HTTPS Cloud Function that streams the backtest process."""
    if req.method != 'POST':
        return Response("Only POST requests are accepted.", status=405)

    req_body = req.get_json()
    
    # Use Flask's Response with stream_with_context to handle the generator
    return Response(stream_with_context(_run_and_stream(req_body)),
                    mimetype='application/x-ndjson')
