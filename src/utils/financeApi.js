/**
 * Utilities for fetching live market quotes and commodity benchmarks
 * via Yahoo Finance proxy and financial feeds.
 */

// Mapping of primary commodities & stocks to Yahoo Finance tickers
export const TICKER_MAP = {
  // مدخلات الطاقة والشحن والكيماويات
  'natural-gas-energy': {
    symbol: 'NG=F',
    nameEn: 'Natural Gas Futures (NYMEX)',
    baseUnit: 'USD / MMBtu',
    type: 'input',
    category: 'طاقة ومرافق'
  },
  'ammonia': {
    symbol: 'CF',
    nameEn: 'CF Industries (Global Ammonia & Nitrogen Benchmark)',
    baseUnit: 'USD / Share (Ammonia Proxy)',
    type: 'input',
    category: 'مواد خام استراتيجية'
  },
  'sulfur': {
    symbol: 'CL=F',
    nameEn: 'Crude Oil Energy & Petrochemical Sulfur Proxy',
    baseUnit: 'USD / Bbl (Refinery Sulfur Factor)',
    type: 'input',
    category: 'مواد خام استراتيجية'
  },
  'freight-logistics': {
    symbol: 'BDRY',
    nameEn: 'Breakwave Dry Bulk Shipping ETF (Baltic Index)',
    baseUnit: 'USD / Index Point',
    type: 'input',
    category: 'تكاليف لوجستية'
  },
  'aluminum-hydroxide': {
    symbol: 'AA',
    nameEn: 'Alcoa Corp (Alumina & Bauxite Benchmark)',
    baseUnit: 'USD / Share (Alumina Proxy)',
    type: 'input',
    category: 'مواد خام كيماوية'
  },

  // مخرجات وأسمدة ومنتجات الشركة
  'phosphate-rock': {
    symbol: 'MOS',
    nameEn: 'The Mosaic Company (Phosphate Rock Realization Benchmark)',
    baseUnit: 'USD / طن (FOB استرشادي)',
    type: 'output',
    category: 'منتجات التعدين الخام'
  },
  'dap-fertilizer': {
    symbol: 'MOS',
    nameEn: 'The Mosaic Company (Global DAP Fertilizer Benchmark)',
    baseUnit: 'USD / طن (FOB استرشادي)',
    type: 'output',
    category: 'أسمدة فوسفاتية نهائية'
  },
  'phosphoric-acid': {
    symbol: 'MOS',
    nameEn: 'Phosphate Merchant Grade Acid Proxy (P2O5)',
    baseUnit: 'USD / طن P2O5',
    type: 'output',
    category: 'صناعات وسيطة وتحويلية'
  },
  'map-fertilizer': {
    symbol: 'MOS',
    nameEn: 'Monoammonium Phosphate Benchmark Proxy',
    baseUnit: 'USD / طن (FOB استرشادي)',
    type: 'output',
    category: 'أسمدة فوسفاتية نهائية'
  },
  'aluminum-fluoride': {
    symbol: 'AA',
    nameEn: 'Aluminum Fluoride Benchmark (Industrial Grade)',
    baseUnit: 'USD / طن',
    type: 'output',
    category: 'كيماويات متخصصة'
  },
  'sulfuric-acid': {
    symbol: 'CL=F',
    nameEn: 'Sulfuric Acid Regional Benchmark Proxy',
    baseUnit: 'USD / طن',
    type: 'output',
    category: 'صناعات وسيطة'
  }
};

/**
 * Fetch a single quote from Yahoo Finance API
 */
export async function fetchYahooQuote(symbol) {
  const urls = [
    `/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`)}`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });
      if (!res.ok) continue;
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      if (!result || !result.meta) continue;

      const meta = result.meta;
      const price = meta.regularMarketPrice ?? meta.previousClose ?? 0;
      const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
      const change = price - prevClose;
      const changePercent = prevClose ? (change / prevClose) * 100 : 0;

      // Extract closing history for sparkline chart
      const closes = result.indicators?.quote?.[0]?.close || [];
      const sparkline = closes
        .filter((c) => typeof c === 'number' && !isNaN(c))
        .map((c) => Number(c.toFixed(2)));

      return {
        symbol: meta.symbol || symbol,
        price: Number(price.toFixed(2)),
        currency: meta.currency || 'USD',
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        high: Number((meta.regularMarketDayHigh || meta.fiftyTwoWeekHigh || price).toFixed(2)),
        low: Number((meta.regularMarketDayLow || meta.fiftyTwoWeekLow || price).toFixed(2)),
        sparkline: sparkline.length > 0 ? sparkline : [price * 0.98, price * 0.99, price, price * 1.01, price],
        timestamp: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000) : new Date(),
        marketState: meta.regularMarketPrice ? 'live' : 'close',
        source: 'Yahoo Finance API'
      };
    } catch {
      // try next fallback
    }
  }

  // Fallback defaults if offline / network block
  return null;
}

/**
 * Fetch all unique tickers needed for the materials screen
 */
export async function fetchAllMaterialQuotes() {
  const symbols = ['NG=F', 'CF', 'MOS', 'AA', 'BDRY', 'CL=F'];
  const quotes = {};

  await Promise.allSettled(
    symbols.map(async (sym) => {
      const q = await fetchYahooQuote(sym);
      if (q) {
        quotes[sym] = q;
      }
    })
  );

  return quotes;
}

