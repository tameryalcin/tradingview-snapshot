# TradingView Snapshot Service

A Node.js service that displays a full-screen TradingView chart widget and provides screenshot functionality using Puppeteer.

## Features

- Full-screen TradingView chart widget
- Screenshot capture endpoint
- HonoJS server with static file serving
- Puppeteer for automated screenshot generation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

## Usage

### View the Chart
Navigate to `http://localhost:3000` to view the full-screen TradingView chart.

### Capture Screenshot
Send a GET request to `http://localhost:3000/screenshot` to capture a screenshot of the chart.

Example:
```bash
curl -o chart.png http://localhost:3000/screenshot
```

## API Endpoints

- `GET /` - Serves the full-screen TradingView chart page
- `GET /screenshot` - Captures and returns a PNG screenshot of the chart
- `GET /health` - Health check endpoint

## Configuration

The chart is configured with:
- Default symbol: BINANCE:BTCUSDT
- Dark theme
- Daily interval
- Full feature set enabled

You can modify the chart configuration in `index.html` by updating the TradingView widget parameters.