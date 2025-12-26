/**
 * Stock API Service
 * Wrapper around API client for stock-related endpoints
 */

import { requestWithRetry } from './api';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface HistoricalPrice {
  timestamp: number;
  price: number;
}

// Simple cache for historical prices to handle 304/empty bodies gracefully
const historyCache = new Map<string, HistoricalPrice[]>();

/**
 * Fetch current stock quote
 * GET /api/proxy/alpha/quote?symbol=AAPL
 */
export const fetchStockQuote = async (symbol: string): Promise<StockQuote> => {
  try {
    const data = await requestWithRetry<StockQuote>({
      url: '/api/proxy/alpha/quote',
      method: 'get',
      params: { symbol: symbol.toUpperCase() },
    });
    return data;
  } catch (error) {
    // preserve useful error info when available
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch quote for ${symbol}: ${msg}`);
  }
};

/**
 * Fetch historical prices from Alpha Vantage
 * GET /api/proxy/alpha/history?symbol=AAPL&days=30
 */
export const fetchHistoricalPrices = async (
  symbol: string,
  days: number = 30
): Promise<HistoricalPrice[]> => {
  try {
    const symbolKey = symbol.toUpperCase();
    const data = await requestWithRetry<HistoricalPrice[]>({
      url: '/api/proxy/alpha/history',
      method: 'get',
      params: { symbol: symbolKey, days },
    });
    if (Array.isArray(data) && data.length > 0) {
      historyCache.set(symbolKey, data);
      return data;
    }

    const cached = historyCache.get(symbolKey);
    if (cached && cached.length > 0) {
      return cached;
    }

    throw new Error('No historical data returned');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch history for ${symbol}: ${msg}`);
  }
};

/**
 * Fetch historical prices from Finnhub (more reliable)
 * GET /api/proxy/finnhub/history?symbol=AAPL&days=30
 */
export const fetchFinnhubHistory = async (
  symbol: string,
  days: number = 30
): Promise<HistoricalPrice[]> => {
  try {
    const symbolKey = symbol.toUpperCase();
    const data = await requestWithRetry<HistoricalPrice[]>({
      url: '/api/proxy/finnhub/history',
      method: 'get',
      params: { symbol: symbolKey, days },
    });
    if (Array.isArray(data) && data.length > 0) {
      historyCache.set(`finnhub_${symbolKey}`, data);
      return data;
    }

    const cached = historyCache.get(`finnhub_${symbolKey}`);
    if (cached && cached.length > 0) {
      return cached;
    }

    throw new Error('No historical data returned from Finnhub');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch Finnhub history for ${symbol}: ${msg}`);
  }
};
