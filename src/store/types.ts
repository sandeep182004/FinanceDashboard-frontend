/**
 * Store Type Definitions
 * Defines the shape of Zustand store for widgets and layout
 */

export interface Widget {
  id: string;
  type: 'finance-card' | 'line-chart' | 'table';
  symbol: string;
  name: string;
  refreshInterval: number; // milliseconds
  createdAt: number;
  provider?: 'alpha' | 'finnhub'; // API provider
  selectedFields?: string[]; // Custom fields to display
}

export interface LayoutConfig {
  columns: number;
  gap: number; // Tailwind spacing (0-12)
}

export interface WidgetState {
  // State
  widgets: Widget[];
  layout: LayoutConfig;
  isHydrated: boolean;

  // Actions: Widget CRUD
  addWidget: (widget: Omit<Widget, 'id' | 'createdAt'>) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  renameWidget: (id: string, name: string) => void;

  // Actions: Order
  reorderWidgets: (sourceId: string, targetId: string) => void;

  // Actions: Layout
  updateLayout: (layout: Partial<LayoutConfig>) => void;

  // Actions: Persistence
  hydrate: () => void;
  clearAll: () => void;
}
