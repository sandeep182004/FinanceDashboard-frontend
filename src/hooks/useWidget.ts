'use client';

/**
 * useWidget Hook
 * Provides common widget operations and state
 */

import { useCallback, useState } from 'react';
import { useWidgetStore } from '@/store/widgetStore';

export const useWidget = (widgetId: string) => {
  const widget = useWidgetStore((state) =>
    state.widgets.find((w) => w.id === widgetId)
  );
  const { updateWidget, renameWidget, removeWidget } = useWidgetStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRename = useCallback(
    (newName: string) => {
      if (widget) {
        renameWidget(widget.id, newName);
      }
    },
    [widget, renameWidget]
  );

  const handleDelete = useCallback(() => {
    removeWidget(widgetId);
  }, [widgetId, removeWidget]);

  const handleUpdateRefreshInterval = useCallback(
    (newInterval: number) => {
      updateWidget(widgetId, { refreshInterval: newInterval });
    },
    [widgetId, updateWidget]
  );

  return {
    widget,
    isLoading,
    setIsLoading,
    error,
    setError,
    handleRename,
    handleDelete,
    handleUpdateRefreshInterval,
  };
};
