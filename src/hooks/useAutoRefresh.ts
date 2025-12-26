'use client';

/**
 * useAutoRefresh Hook
 * Manages auto-refresh intervals for widgets
 * Handles mounting/unmounting cleanup
 */

import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  interval: number; // milliseconds
  onRefresh: () => void | Promise<void>;
  enabled?: boolean;
}

export const useAutoRefresh = ({
  interval,
  onRefresh,
  enabled = true,
}: UseAutoRefreshOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || interval <= 0) {
      return;
    }

    // Call immediately on mount
    onRefresh();

    // Set up interval
    intervalRef.current = setInterval(() => {
      onRefresh();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, onRefresh, enabled]);
};
