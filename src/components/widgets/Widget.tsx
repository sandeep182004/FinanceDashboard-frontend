/**
 * Widget Wrapper Component
 * Routes to correct widget type based on config
 */

import React from 'react';
import { FinanceCard } from './FinanceCard';
import { LineChartWidget } from './LineChart';
import { TableWidget } from './TableWidget';
import { Widget } from '@/store/types';
import { useWidgetStore } from '@/store/widgetStore';

interface WidgetContainerProps {
  widget: Widget;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({ widget }) => {
  const removeWidget = useWidgetStore((state) => state.removeWidget);

  // Normalize any unexpected template types to supported ones
  const normalizedType = (() => {
    if (widget.type === 'finance-card' || widget.type === 'line-chart' || widget.type === 'table') {
      return widget.type;
    }

    // Fallback mappings for common template naming variants
    const map: Record<string, Widget['type']> = {
      card: 'finance-card',
      'finance-card': 'finance-card',
      chart: 'line-chart',
      line: 'line-chart',
      'line-chart': 'line-chart',
      table: 'table',
      'stock-table': 'table',
    };

    return (map[widget.type as keyof typeof map] || 'unknown') as Widget['type'] | 'unknown';
  })();

  if (normalizedType === 'unknown') {
    return (
      <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">Unknown widget type</p>
          <p className="text-sm text-red-600/80">Type: {widget.type || 'unspecified'}</p>
        </div>
        <button
          className="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
          onClick={() => removeWidget(widget.id)}
        >
          Remove
        </button>
      </div>
    );
  }

  switch (widget.type) {
    case 'finance-card':
      return <FinanceCard widgetId={widget.id} />;
    case 'line-chart':
      return <LineChartWidget widgetId={widget.id} />;
    case 'table':
      return <TableWidget widgetId={widget.id} />;
    default:
      return null;
  }
};
