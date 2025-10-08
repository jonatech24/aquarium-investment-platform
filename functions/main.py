import functions_framework
from firebase_admin import initialize_app
from firebase_functions import options, https_fn
import pandas as pd
import yfinance as yf
from werkzeug.datastructures import FileStorage
import importlib.util
import sys
import json
from datetime import datetime
import re # Import regex module

# Import API libraries (add them to requirements.txt when you uncomment the code)
# from alpaca_trade_api.rest import REST, TimeFrame as AlpacaTimeFrame
# from polygon import RESTClient as PolygonRESTClient

from backtest_engine import run_backtest

# --- API KEY CONFIGURATION ---
# Add your API keys here. Leave as None if you are not using the service.
ALPACA_API_KEY = None
ALPACA_SECRET_KEY = None
POLYGON_API_KEY = None
# -----------------------------

# Initialize Firebase (if not already done)
try:
    initialize_app()
except ValueError:
    pass

# Define CORS options
cors_options = options.CorsOptions(
    cors_origins=[
        "http://localhost:3000", # Local dev
        "https://*.web.app", # Your deployed Firebase app
        "https://*.firebaseapp.com",
    ],
    cors_methods=["post"],
)

def load_strategy_module(strategy_id):
    """Dynamically loads a strategy module from the 'strategies' directory."""
    if not strategy_id.replace('_', '').isalnum():
        raise ValueError(f"Invalid strategy ID: {strategy_id}")

    module_name = f"strategies.{strategy_id}"
    file_path = f"./strategies/{strategy_id}.py"

    if module_name in sys.modules:
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
        req_body = req.form.to_dict()
        
        # General parameters
        strategy_id = req_body.get('strategy')
        if not strategy_id:
            raise ValueError("Strategy ID is missing.")

        initial_capital = float(req_body.get('cash', 100000))
        
        # Strategy-specific parameters
        if 'params' in req_body:
            strategy_params = json.loads(req_body['params'])
        else:
            raise ValueError("Strategy parameters are missing.")

        # Data source parameters
        data_source = req_body.get('dataSource', 'yahoo')
        timeframe = req_body.get('timeframe')
        ticker = req_body.get('ticker')
        start_date = req_body.get('startDate')
        end_date = req_body.get('endDate')
        
        data = None

        # --- Load Data based on the selected source ---
        if data_source == 'csv':
            if 'csv_file' not in req.files:
                raise ValueError("CSV file is missing.")
            csv_file: FileStorage = req.files['csv_file']
            data = pd.read_csv(csv_file.stream, parse_dates=True, index_col=0)

        elif data_source == 'yahoo':
            if not all([ticker, start_date, end_date, timeframe]):
                raise ValueError("Ticker, Start Date, End Date, and Timeframe are required for Yahoo Finance.")
            data = yf.download(ticker, start=start_date, end=end_date, interval=timeframe)

        elif data_source == 'alpaca':
            if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
                raise ValueError("Alpaca API Key/Secret is not configured in functions/main.py.")
            if not all([ticker, start_date, end_date, timeframe]):
                raise ValueError("Ticker, Start Date, End Date, and Timeframe are required for Alpaca.")
            
            # --- CODE TO FETCH ALPACA DATA (COMMENTED) ---
            # 1. Add 'alpaca-trade-api' to functions/requirements.txt
            # 2. Uncomment the 'from alpaca_trade_api...' import at the top of this file.
            # 3. Uncomment the block below and fill in your details.
            # 
            # api = REST(key_id=ALPACA_API_KEY, secret_key=ALPACA_SECRET_KEY, base_url='https://paper-api.alpaca.markets') # Use 'https://api.alpaca.markets' for live
            #
            # # Map frontend timeframe to Alpaca's TimeFrame enum
            # timeframe_map = {
            #     '1Min': AlpacaTimeFrame.Minute,
            #     '5Min': AlpacaTimeFrame.Minute,
            #     '15Min': AlpacaTimeFrame.Minute,
            #     '1H': AlpacaTimeFrame.Hour,
            #     '1D': AlpacaTimeFrame.Day
            # }
            # # For minute-based data, you might need to specify the multiplier if the API supports it
            # # or handle resampling pandas-side if you fetch '1Min' data.
            # alpaca_tf = timeframe_map.get(timeframe)
            # if not alpaca_tf:
            #     raise ValueError(f"Unsupported timeframe for Alpaca: {timeframe}")
            #
            # # Fetch data
            # bars = api.get_bars(ticker, alpaca_tf, start_date, end_date, adjustment='raw').df
            # # Alpaca returns timezone-aware timestamps; yfinance doesn't. Standardize to UTC.
            # bars = bars.tz_convert('UTC')
            # data = bars
            #
            raise NotImplementedError("Alpaca data source is not yet implemented. Please uncomment the code in functions/main.py.")

        elif data_source == 'polygon':
            if not POLYGON_API_KEY:
                raise ValueError("Polygon API Key is not configured in functions/main.py.")
            if not all([ticker, start_date, end_date, timeframe]):
                raise ValueError("Ticker, Start Date, End Date, and Timeframe are required for Polygon.")

            # --- CODE TO FETCH POLYGON DATA (COMMENTED) ---
            # 1. Add 'polygon-python-client' to functions/requirements.txt
            # 2. Uncomment the 'from polygon...' import at the top of this file.
            # 3. Uncomment the block below.
            #
            # client = PolygonRESTClient(POLYGON_API_KEY)
            # 
            # # Parse the timeframe string e.g., "5-minute" into multiplier and timespan
            # match = re.match(r"(\d+)-(\w+)", timeframe)
            # if not match:
            #     raise ValueError(f"Invalid timeframe format for Polygon: {timeframe}")
            #
            # multiplier, timespan = match.groups()
            # multiplier = int(multiplier)
            #
            # aggs = client.get_aggs(ticker, multiplier, timespan, start_date, end_date)
            # if not aggs:
            #      raise ValueError("No data returned from Polygon. Check ticker and date range.")
            #
            # df = pd.DataFrame(aggs)
            # df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            # df = df.set_index('timestamp').tz_localize('UTC')
            # df.rename(columns={
            #     'open': 'Open', 'high': 'High', 'low': 'Low', 'close': 'Close', 'volume': 'Volume'
            # }, inplace=True)
            # data = df[['Open', 'High', 'Low', 'Close', 'Volume']]
            #
            raise NotImplementedError("Polygon.io data source is not yet implemented. Please uncomment the code in functions/main.py.")
        
        else:
            raise ValueError(f"Unsupported data source: {data_source}")
            
        if data is None or data.empty:
            raise ValueError("Could not load data. Please check your inputs (e.g., ticker validity, date range).")

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
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=400,
            mimetype="application/json"
        )
