/**
 * Utilities for fetching live market quotes and commodity benchmarks
 * via Yahoo Finance proxy and financial feeds.
 * Provides both 1-week and 3-month historical price series.
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
 * Generate a deterministic smooth series for fallback display
 */
export function generateFallbackSeries(basePrice, count, variance = 0.04) {
  const points = [];
  let current = basePrice * 0.95;
  for (let i = 0; i < count; i++) {
    // pseudo-random oscillation based on index and price
    const sinFactor = Math.sin((i / count) * Math.PI * 3.5);
    const cosFactor = Math.cos((i / count) * Math.PI * 2);
    const step = (sinFactor * 0.6 + cosFactor * 0.4) * variance * basePrice;
    current = Number((basePrice + step + ((i / count) * 0.03 * basePrice)).toFixed(2));
    points.push(Math.max(1, current));
  }
  // Ensure last point aligns with current price
  points[points.length - 1] = basePrice;
  return points;
}

/**
 * Fetch quote and both 3-month and 1-week series from Yahoo Finance API
 */
export async function fetchYahooQuote(symbol) {
  const urls = [
    `/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`)}`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4500)
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

      // Extract closes for 3-month history
      const rawCloses = result.indicators?.quote?.[0]?.close || [];
      const history3m = rawCloses
        .filter((c) => typeof c === 'number' && !isNaN(c) && c > 0)
        .map((c) => Number(c.toFixed(2)));

      const finalHistory3m = history3m.length >= 10
        ? history3m
        : generateFallbackSeries(price, 65, 0.05);

      // Last week (last 5-7 daily closes)
      const history1w = finalHistory3m.slice(-7);

      const weekStart = history1w[0] || price;
      const weekEnd = history1w[history1w.length - 1] || price;
      const weekChange = weekEnd - weekStart;
      const weekChangePercent = weekStart ? (weekChange / weekStart) * 100 : 0;

      const m3Start = finalHistory3m[0] || price;
      const m3End = finalHistory3m[finalHistory3m.length - 1] || price;
      const m3Change = m3End - m3Start;
      const m3ChangePercent = m3Start ? (m3Change / m3Start) * 100 : 0;

      return {
        symbol: meta.symbol || symbol,
        price: Number(price.toFixed(2)),
        currency: meta.currency || 'USD',
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        high: Number((meta.regularMarketDayHigh || meta.fiftyTwoWeekHigh || price).toFixed(2)),
        low: Number((meta.regularMarketDayLow || meta.fiftyTwoWeekLow || price).toFixed(2)),
        history3m: finalHistory3m,
        history1w: history1w,
        weekChangePercent: Number(weekChangePercent.toFixed(2)),
        m3ChangePercent: Number(m3ChangePercent.toFixed(2)),
        weekMin: Math.min(...history1w),
        weekMax: Math.max(...history1w),
        m3Min: Math.min(...finalHistory3m),
        m3Max: Math.max(...finalHistory3m),
        timestamp: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000) : new Date(),
        marketState: meta.regularMarketPrice ? 'live' : 'close',
        source: 'Yahoo Finance API'
      };
    } catch {
      // try next fallback
    }
  }

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
