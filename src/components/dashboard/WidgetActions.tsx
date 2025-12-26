/**
 * Widget Actions Component
 * Controls to add/manage widgets
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/common/Modal';
import { WidgetForm } from '@/components/common/WidgetForm';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { DashboardControls } from './DashboardControls';
import { useWidgetStore } from '@/store/widgetStore';
import { Widget } from '@/store/types';

export const WidgetActions: React.FC = () => {
  const addWidget = useWidgetStore((state) => state.addWidget);
  const updateWidget = useWidgetStore((state) => state.updateWidget);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);

  // Expose edit function globally for widget components
  React.useEffect(() => {
    (window as any).editWidget = (widget: Widget) => {
      setEditingWidget(widget);
      setIsModalOpen(true);
    };
  }, []);

  const handleSubmit = (data: {
    type: 'finance-card' | 'line-chart' | 'table';
    symbol: string;
    name: string;
    refreshInterval: number;
    provider: 'alpha' | 'finnhub';
    selectedFields: string[];
  }) => {
    if (editingWidget) {
      // Update existing widget
      updateWidget(editingWidget.id, {
        symbol: data.symbol,
        name: data.name,
        refreshInterval: data.refreshInterval,
        provider: data.provider,
        selectedFields: data.selectedFields,
      });
    } else {
      // Add new widget
      addWidget({
        type: data.type,
        symbol: data.symbol,
        name: data.name,
        refreshInterval: data.refreshInterval,
        provider: data.provider,
        selectedFields: data.selectedFields,
      });
    }
    setEditingWidget(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Finance Dashboard</h1>
        <div className="flex gap-3">
          <ThemeToggle />
          <Button onClick={() => setIsModalOpen(true)}>+ Add Widget</Button>
        </div>
      </div>

      {/* Dashboard Controls (Export/Import/Templates) */}
      <div className="mb-6">
        <DashboardControls />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setEditingWidget(null);
          setIsModalOpen(false);
        }}
        title={editingWidget ? 'Edit Widget' : 'Add New Widget'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setEditingWidget(null);
                setIsModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const form = document.querySelector('form[data-widget-form]') as HTMLFormElement | null;
                if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
              }}
            >
              {editingWidget ? 'Save Changes' : 'Add Widget'}
            </Button>
          </div>
        }
      >
        <WidgetForm
          initialData={editingWidget || undefined}
          onSubmit={handleSubmit}
        />
      </Modal>
    </>
  );
};
