'use client';

/**
 * DashboardControls Component
 * Export/Import/Save/Load dashboard configurations
 */

import React, { useState, useRef } from 'react';
import { useWidgetStore } from '@/store/widgetStore';
import { Button } from '@/components/ui/Button';
import { TemplateSelector } from '@/components/common/TemplateSelector';
import {
  exportDashboardConfig,
  downloadDashboardConfig,
  importDashboardConfig,
  readConfigFile,
  saveDashboardConfig,
} from '@/utils/dashboardConfig';

export const DashboardControls: React.FC = () => {
  const widgets = useWidgetStore((state) => state.widgets);
  const layout = useWidgetStore((state) => state.layout);
  const hydrate = useWidgetStore((state) => state.hydrate);
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Export dashboard configuration
  const handleExport = async () => {
    setIsLoading(true);
    try {
      const config = await exportDashboardConfig();
      downloadDashboardConfig(config, `dashboard-${Date.now()}.json`);
      showMessage('Dashboard exported successfully', 'success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Export failed';
      showMessage(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Import dashboard configuration
  const handleImport = async () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const config = await readConfigFile(file);
      await importDashboardConfig(config);
      hydrate(); // Reload dashboard from localStorage
      showMessage('Dashboard imported successfully', 'success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Import failed';
      showMessage(msg, 'error');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Save current dashboard
  const handleSave = async () => {
    const id = prompt('Enter a name for this dashboard configuration:');
    if (!id) return;

    setIsLoading(true);
    try {
      const config = {
        widgets,
        layout,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveDashboardConfig(id, config);
      showMessage(`Dashboard "${id}" saved successfully`, 'success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Save failed';
      showMessage(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved dashboard
  // Apply template
  const handleApplyTemplate = (template: any) => {
    const store = useWidgetStore.getState();
    
    // Clear existing widgets
    widgets.forEach((w) => store.removeWidget(w.id));
    
    // Add template widgets
    template.widgets.forEach((widget: any) => {
      store.addWidget(widget);
    });
    
    showMessage(`Template "${template.name}" applied successfully`, 'success');
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isLoading || widgets.length === 0}
          size="sm"
          variant="secondary"
          title="Export dashboard configuration as JSON"
        >
          📥 Export
        </Button>

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={isLoading}
          size="sm"
          variant="secondary"
          title="Import dashboard configuration from JSON"
        >
          📤 Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isLoading || widgets.length === 0}
          size="sm"
          variant="secondary"
          title="Save current dashboard configuration"
        >
          💾 Save
        </Button>

        {/* Template Button */}
        <Button
          onClick={() => setIsTemplateModalOpen(true)}
          disabled={isLoading}
          size="sm"
          title="Create dashboard from template"
        >
          📋 New from Template
        </Button>

        {/* Loading Indicator */}
        {isLoading && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Processing...
          </span>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onApply={handleApplyTemplate}
      />
    </>
  );
};
