# **App Name**: MLGO Trading Platform

## Core Features:

- Backtesting Engine: Executes backtests of trading strategies using historical market data fetched via API.  The strategy logic and backtesting configuration will be loaded using tool to load configurations from the database.
- Strategy Optimization: Optimizes trading strategy parameters using grid search and returns optimal parameter sets. Relies on AI to manage a cloud based array job.
- Live Trading Simulation: Simulates live trading using real-time market data and allows users to test strategies in a simulated environment.
- News Integration: Fetches relevant news articles based on selected tickers using tool. Presents news feed with sentiment analysis scores to inform trading decisions. Stores in firestore.
- Market Data Dashboard: Displays historical and real-time market data, and key metrics with interactive charts (TradingView integration).
- Trade Execution Logging: Logs all trade executions, backtesting results, and performance metrics to Firestore, enabling performance tracking.
- User Authentication and Configuration: Manages user accounts with Firebase Authentication, with Firestore based storage.

## Style Guidelines:

- Primary color: Dark slate blue (#483D8B) for a professional and sophisticated feel.
- Background color: Very dark blue-gray (#2F4F4F) to reduce eye strain during long trading sessions.
- Accent color: Pale gold (#E6BE8A) to highlight important information and actions.
- Body and headline font: 'Inter', a grotesque-style sans-serif, to create a neutral and machined look.
- Use simple, geometric icons to represent different financial instruments and trading actions.
- Maintain a clean and organized layout with clear sections for data visualization, configuration, and news feeds.
- Subtle animations to indicate data updates and state transitions to enhance user experience.