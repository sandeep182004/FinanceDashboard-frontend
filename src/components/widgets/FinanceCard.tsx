/**
 * Finance Card Widget
 * Displays current stock price and change percentage
 * Uses WebSocket for real-time updates
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useWidget } from '@/hooks/useWidget';
import { useWebSocketQuote } from '@/hooks/useWebSocketQuote';
import { formatCurrency, formatNumber, formatPercent, formatDateTime } from '@/utils/format';

interface FinanceCardProps {
  widgetId: string;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({ widgetId }) => {
  const { widget, handleDelete } = useWidget(widgetId);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Use WebSocket instead of HTTP polling
  const { data: quote, error, isConnected } = useWebSocketQuote({
    symbol: widget?.symbol || '',
    provider: widget?.provider || 'alpha',
    enabled: !!widget && autoRefreshEnabled,
    intervalMs: widget?.refreshInterval || 10000,
  });

  if (!widget) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p className="text-gray-500">Widget not found</p>
      </Card>
    );
  }

  const isPositive = (quote?.change || 0) >= 0;

  return (
    <Card className="h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{widget.name}</h3>
          <p className="text-sm text-gray-500">{widget.symbol}</p>
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

      {/* Content */}
      {error ? (
        <div className="text-center py-8">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : !quote ? (
        <LoadingSpinner size="sm" message={isConnected ? "Waiting for data..." : "Connecting..."} />
      ) : (
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(quote.price)}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`text-lg font-semibold ${
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatNumber(quote.change, { showSign: true })}
            </span>
            <span
              className={`text-sm ${
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              ({formatPercent(quote.changePercent, { showSign: true })})
            </span>
          </div>
          {quote.timestamp && (
            <p className="mt-4 text-xs text-gray-500">
              Updated: {formatDateTime(quote.timestamp, { timeStyle: 'short', dateStyle: 'short' })}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-600 dark:text-gray-300">
          <label className="inline-flex items-center gap-2 select-none cursor-pointer">
            <input
              type="checkbox"
              className="accent-blue-600 cursor-pointer"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
