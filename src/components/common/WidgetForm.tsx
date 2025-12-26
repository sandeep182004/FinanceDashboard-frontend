'use client';

/**
 * Reusable Widget Form Component
 * Used for both adding and editing widgets
 */

import React from 'react';
import { Input } from '@/components/ui/Input';
import { FieldPicker } from './FieldPicker';
import { Widget } from '@/store/types';
import { getDefaultFields } from '@/utils/apiSchema';

interface WidgetFormProps {
  initialData?: Partial<Widget>;
  onSubmit: (data: {
    type: 'finance-card' | 'line-chart' | 'table';
    symbol: string;
    name: string;
    refreshInterval: number;
    provider: 'alpha' | 'finnhub';
    selectedFields: string[];
  }) => void;
}

export const WidgetForm: React.FC<WidgetFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const DEFAULT_TABLE_SYMBOLS = 'AAPL,MSFT,GOOGL,AMZN,META,TSLA,NVDA,NFLX';
  const [formData, setFormData] = React.useState({
    type: (initialData?.type || 'finance-card') as 'finance-card' | 'line-chart' | 'table',
    symbol: initialData?.symbol || '',
    name: initialData?.name || '',
    refreshInterval: initialData?.refreshInterval || 10000,
    provider: (initialData?.provider || 'alpha') as 'alpha' | 'finnhub',
    selectedFields: initialData?.selectedFields || getDefaultFields(initialData?.type || 'finance-card'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol.trim() || !formData.name.trim()) {
      alert('Please fill in all fields');
      return;
    }
    onSubmit({
      ...formData,
      symbol: formData.symbol.toUpperCase(),
    });
  };

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit}
      data-widget-form
    >
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
          Widget Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => {
            const nextType = e.target.value as 'finance-card' | 'line-chart' | 'table';
            setFormData((prev) => ({
              ...prev,
              type: nextType,
              symbol:
                nextType === 'table' && !prev.symbol.trim()
                  ? DEFAULT_TABLE_SYMBOLS
                  : prev.symbol,
              selectedFields: getDefaultFields(nextType),
            }));
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
          disabled={!!initialData?.id} // Disable type change on edit
        >
          <option value="finance-card">Finance Card (Price)</option>
          <option value="line-chart">Line Chart (History)</option>
          <option value="table">Table (Multiple Stocks)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
          API Provider
        </label>
        <select
          value={formData.provider}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              provider: e.target.value as 'alpha' | 'finnhub',
            }));
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
        >
          <option value="alpha">Alpha Vantage</option>
          <option value="finnhub">Finnhub</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
          {formData.type === 'table'
            ? 'Symbols (comma separated)'
            : 'Stock Symbol'}
        </label>
        <Input
          placeholder={
            formData.type === 'table'
              ? 'e.g., AAPL, MSFT, NVDA'
              : 'e.g., AAPL, GOOGL, MSFT'
          }
          value={formData.symbol}
          onChange={(e) =>
            setFormData({
              ...formData,
              symbol: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
          Widget Name
        </label>
        <Input
          placeholder="e.g., Apple Stock"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
          Refresh Interval (ms)
        </label>
        <Input
          type="number"
          min="5000"
          step="5000"
          value={formData.refreshInterval}
          onChange={(e) =>
            setFormData({
              ...formData,
              refreshInterval: parseInt(e.target.value),
            })
          }
        />
      </div>

      {/* Field Picker for custom field selection */}
      {formData.symbol && (
        <FieldPicker
          provider={formData.provider}
          symbol={formData.symbol}
          widgetType={formData.type}
          selectedFields={formData.selectedFields}
          onChange={(fields) =>
            setFormData({
              ...formData,
              selectedFields: fields,
            })
          }
        />
      )}

      <button type="submit" className="sr-only">
        Submit
      </button>
    </form>
  );
};
