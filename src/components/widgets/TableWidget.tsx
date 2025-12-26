/**
 * Table Widget
 * Shows a small list of stocks with price and change%
 */

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useWidget } from '@/hooks/useWidget';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { fetchStockQuote, StockQuote } from '@/services/stockService';
import { formatCurrency, formatPercent } from '@/utils/format';

interface StockMeta {
  symbol: string;
  company: string;
}

interface TableRow {
  symbol: string;
  company: string;
  price: number;
  changePercent: number;
}

const DEFAULT_STOCKS: StockMeta[] = [
  { symbol: 'AAPL', company: 'Apple' },
  { symbol: 'MSFT', company: 'Microsoft' },
  { symbol: 'GOOGL', company: 'Alphabet' },
  { symbol: 'AMZN', company: 'Amazon' },
  { symbol: 'META', company: 'Meta' },
  { symbol: 'TSLA', company: 'Tesla' },
  { symbol: 'NVDA', company: 'NVIDIA' },
  { symbol: 'NFLX', company: 'Netflix' },
  { symbol: 'INTC', company: 'Intel' },
  { symbol: 'AMD', company: 'AMD' },
];

const normalizeSymbols = (symbols: string | undefined): StockMeta[] => {
  const fallback = DEFAULT_STOCKS.slice(0, 8);
  if (!symbols) return fallback;

  const parts = symbols
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const unique = Array.from(new Set(parts)).slice(0, 10);
  if (unique.length === 0) return fallback;

  const lookup = new Map(DEFAULT_STOCKS.map((s) => [s.symbol, s.company]));
  return unique.map((symbol) => ({
    symbol,
    company: lookup.get(symbol) || symbol,
  }));
};

export const TableWidget: React.FC<{ widgetId: string }> = ({ widgetId }) => {
  const { widget, isLoading, setIsLoading, error, setError, handleDelete } =
    useWidget(widgetId);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [search, setSearch] = useState('');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const symbols = useMemo(
    () => normalizeSymbols(widget?.symbol),
    [widget?.symbol]
  );

  const fetchQuotes = useCallback(async () => {
    if (!widget) return;
    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        symbols.map((stock) => fetchStockQuote(stock.symbol))
      );

      const nextRows: TableRow[] = [];
      const failures: string[] = [];

      results.forEach((result, idx) => {
        const meta = symbols[idx];
        if (result.status === 'fulfilled') {
          const quote: StockQuote = result.value;
          nextRows.push({
            symbol: quote.symbol,
            company: meta.company,
            price: quote.price,
            changePercent: quote.changePercent,
          });
        } else {
          failures.push(meta.symbol);
        }
      });

      if (nextRows.length === 0 && failures.length > 0) {
        setError(`Failed to load quotes for: ${failures.join(', ')}`);
      } else if (failures.length > 0) {
        setError(`Partial data (failed: ${failures.join(', ')})`);
      }

      setRows(nextRows);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load table';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [widget, symbols]);

  useAutoRefresh({
    interval: widget?.refreshInterval || 60000,
    onRefresh: fetchQuotes,
    enabled: !!widget && autoRefreshEnabled,
  });

  // Initial load once on mount/when symbols change
  React.useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  if (!widget) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p className="text-gray-500">Widget not found</p>
      </Card>
    );
  }

  const filteredRows = rows.filter((row) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      row.symbol.toLowerCase().includes(term) ||
      row.company.toLowerCase().includes(term)
    );
  });

  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold">{widget.name || 'Stock Table'}</h3>
          <p className="text-sm text-gray-500">
            Tracking {symbols.length} symbols · Refresh {Math.round((widget.refreshInterval || 60000) / 1000)}s
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => (window as any).editWidget?.(widget)}
            className="text-gray-400 hover:text-blue-500 transition"
            title="Edit widget"
          >
            ⚙️
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition"
            title="Delete widget"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mb-3">
        <Input
          placeholder="Search by symbol or company"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto border rounded-lg">
        {isLoading && rows.length === 0 ? (
          <div className="flex items-center justify-center h-full py-8">
            <LoadingSpinner size="sm" message="" />
          </div>
        ) : error && rows.length === 0 ? (
          <div className="p-4 text-sm text-red-600 bg-red-50">{error}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Company</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Change %</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={3}>
                    No matches
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isPositive = (row.changePercent || 0) >= 0;
                  return (
                    <tr key={row.symbol} className="border-t">
                      <td className="px-4 py-2">
                        <div className="font-semibold">{row.company}</div>
                        <div className="text-xs text-gray-500">{row.symbol}</div>
                      </td>
                      <td className="px-4 py-2">{formatCurrency(row.price)}</td>
                      <td
                        className={`px-4 py-2 font-semibold ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatPercent(row.changePercent, { showSign: true })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {error && rows.length > 0 && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
          <label className="inline-flex items-center gap-2 select-none">
            <input
              type="checkbox"
              className="accent-blue-600"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
            />
            Auto-refresh
          </label>
          <span className="text-xs text-gray-500">
            {autoRefreshEnabled ? 'On' : 'Off'} · {Math.round((widget.refreshInterval || 60000) / 1000)}s
          </span>
        </div>
        <Button onClick={fetchQuotes} disabled={isLoading} size="sm" className="w-full">
          Refresh
        </Button>
      </div>
    </Card>
  );
};
