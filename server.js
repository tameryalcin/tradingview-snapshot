import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import puppeteer from "puppeteer";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create screenshots directory if it doesn't exist
const screenshotsDir = join(__dirname, "screenshots");
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

const app = new Hono();

// Serve static files
app.use("/*", serveStatic({ root: "./" }));

// Serve screenshots
app.use("/screenshots/*", serveStatic({ root: "./" }));

// Screenshot endpoint with optional symbol and timeframe parameters
app.get("/screenshot/:symbol?/:timeframe?", async (c) => {
  const symbol = c.req.param("symbol") || "BTCUSDT";
  const timeframe = c.req.param("timeframe") || "1D";
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1280,720",
        "--disable-features=VizDisplayCompositor",
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `tradingview-chart-${symbol}-${timeframe}-${timestamp}.png`;
    const filepath = join(screenshotsDir, filename);

    // Navigate to the chart page with symbol and timeframe parameters
    const url = `http://localhost:3000?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for TradingView widget to load
    await page.waitForSelector("#tradingview-widget", { timeout: 10000 });

    // Wait for the TradingView script to load and execute
    await page.waitForFunction(
      () => {
        const widget = document.querySelector(".tradingview-widget-container");
        return widget && widget.querySelector("iframe");
      },
      { timeout: 30000 }
    );

    // Wait for chart to fully render
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Take screenshot
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    await browser.close();

    // Save screenshot to file
    writeFileSync(filepath, screenshot);

    // Return the filename in response
    return c.json({
      success: true,
      symbol: symbol,
      timeframe: timeframe,
      filename: filename,
      path: `/screenshots/${filename}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Screenshot error:", error);
    return c.json({ error: "Failed to capture screenshot", details: error.message }, 500);
  }
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root endpoint - serve the chart page
app.get("/", (c) => {
  try {
    const html = readFileSync(join(__dirname, "index.html"), "utf8");
    return c.html(html);
  } catch (error) {
    return c.json({ error: "Failed to load chart page" }, 500);
  }
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
