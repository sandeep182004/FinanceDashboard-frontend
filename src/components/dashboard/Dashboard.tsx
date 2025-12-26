/**
 * Main Dashboard Component
 * Orchestrates store hydration and renders dashboard
 */

'use client';

import React, { useEffect } from 'react';
import { WidgetGrid } from './WidgetGrid';
import { WidgetActions } from './WidgetActions';
import { useWidgetStore } from '@/store/widgetStore';

export const Dashboard: React.FC = () => {
  const isHydrated = useWidgetStore((state) => state.isHydrated);
  const hydrate = useWidgetStore((state) => state.hydrate);

  // Hydrate from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WidgetActions />
      <WidgetGrid />
    </div>
  );
};
