/**
 * Line Chart Widget
 * Displays historical price data
 */

'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useWidget } from '@/hooks/useWidget';
import { fetchFinnhubHistory, HistoricalPrice } from '@/services/stockService';
import { formatCurrency } from '@/utils/format';

interface LineChartProps {
  widgetId: string;
}

export const LineChartWidget: React.FC<LineChartProps> = ({ widgetId }) => {
  const { widget, isLoading, setIsLoading, error, setError, handleDelete } =
    useWidget(widgetId);
  const [data, setData] = useState<HistoricalPrice[]>([]);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const fetchData = async () => {
    if (!widget) return;
    setIsLoading(true);
    setError(null);
    try {
      const prices = await fetchFinnhubHistory(widget.symbol, 30);
      setData(prices);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch chart data'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh logic
  useAutoRefresh({
    interval: widget?.refreshInterval || 60000,
    onRefresh: fetchData,
    enabled: !!widget && autoRefreshEnabled,
  });

  if (!widget) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p className="text-gray-500">Widget not found</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{widget.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{widget.symbol} (30 days)</p>
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
      {isLoading && data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="sm" message="" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
          {error}
        </div>
      ) : data.length > 0 ? (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(ts) =>
                  new Date(ts).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
              />
              <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, white)',
                  border: '1px solid var(--tooltip-border, #e5e7eb)',
                  borderRadius: '0.375rem',
                  color: 'var(--tooltip-text, #374151)'
                }}
                formatter={(value) =>
                  typeof value === 'number' ? formatCurrency(value as number) : value
                }
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString()
                }
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
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
            Auto-refresh
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {autoRefreshEnabled ? 'On' : 'Off'} · {Math.round((widget.refreshInterval || 60000) / 1000)}s
          </span>
        </div>
        <Button
          onClick={fetchData}
          disabled={isLoading}
          size="sm"
          className="w-full"
        >
          Refresh
        </Button>
      </div>
    </Card>
  );
};
