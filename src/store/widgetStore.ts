'use client';

/**
 * Zustand Widget Store
 * Manages dashboard widgets, layout configuration, and persistence
 */

import { create } from 'zustand';
import { WidgetState, Widget, LayoutConfig } from './types';

const normalizeWidgetType = (type: Widget['type']): Widget['type'] | 'unknown' => {
  if (type === 'finance-card' || type === 'line-chart' || type === 'table') {
    return type;
  }

  const map: Record<string, Widget['type']> = {
    card: 'finance-card',
    'finance-card': 'finance-card',
    chart: 'line-chart',
    line: 'line-chart',
    'line-chart': 'line-chart',
    table: 'table',
    'stock-table': 'table',
  };

  return map[type as keyof typeof map] || 'unknown';
};

const STORAGE_KEY = 'groww_dashboard_state';
const DEFAULT_LAYOUT: LayoutConfig = {
  columns: 3,
  gap: 4,
};

const DEFAULT_STATE = {
  widgets: [],
  layout: DEFAULT_LAYOUT,
  isHydrated: false,
};

const persistState = (widgets: Widget[], layout: LayoutConfig) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      widgets,
      layout,
    })
  );
};

export const useWidgetStore = create<WidgetState>((set) => ({
  ...DEFAULT_STATE,

  // Add a new widget
  addWidget: (widget) =>
    set((state) => {
      const normalizedType = normalizeWidgetType(widget.type);
      if (normalizedType === 'unknown') {
        console.warn('Skipping unknown widget type', widget.type);
        return state;
      }

      const newWidget: Widget = {
        ...widget,
        type: normalizedType,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      const widgets = [...state.widgets, newWidget];
      persistState(widgets, state.layout);
      return { widgets };
    }),

  // Remove a widget by id
  removeWidget: (id) =>
    set((state) => {
      const widgets = state.widgets.filter((w) => w.id !== id);
      persistState(widgets, state.layout);
      return { widgets };
    }),

  // Update specific widget fields
  updateWidget: (id, updates) =>
    set((state) => {
      const widgets = state.widgets.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      );
      persistState(widgets, state.layout);
      return { widgets };
    }),

  // Rename widget
  renameWidget: (id, name) =>
    set((state) => {
      const widgets = state.widgets.map((w) =>
        w.id === id ? { ...w, name } : w
      );
      persistState(widgets, state.layout);
      return { widgets };
    }),

  // Reorder widgets by id
  reorderWidgets: (sourceId, targetId) =>
    set((state) => {
      if (sourceId === targetId) return state;

      const sourceIndex = state.widgets.findIndex((w) => w.id === sourceId);
      const targetIndex = state.widgets.findIndex((w) => w.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) return state;

      const widgets = [...state.widgets];
      const [moved] = widgets.splice(sourceIndex, 1);
      widgets.splice(targetIndex, 0, moved);

      persistState(widgets, state.layout);
      return { widgets };
    }),

  // Update layout configuration
  updateLayout: (layout) =>
    set((state) => {
      const updatedLayout = { ...state.layout, ...layout };
      persistState(state.widgets, updatedLayout);
      return { layout: updatedLayout };
    }),

  // Load from localStorage
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const widgets = Array.isArray(data.widgets)
          ? (data.widgets as Widget[]).filter((w) => normalizeWidgetType(w.type) !== 'unknown')
          : [];

        set({
          widgets,
          layout: data.layout || DEFAULT_LAYOUT,
          isHydrated: true,
        });
      } catch (error) {
        console.error('Failed to hydrate store:', error);
        set({ isHydrated: true });
      }
    } else {
      set({ isHydrated: true });
    }
  },

  // Clear all data
  clearAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    set({ ...DEFAULT_STATE, isHydrated: true });
  },
}));
