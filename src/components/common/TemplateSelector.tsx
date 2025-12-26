'use client';

/**
 * TemplateSelector Component
 * Allows users to select and apply dashboard templates
 */

import React, { useEffect, useState } from 'react';
import { requestWithRetry } from '@/services/api';
import { Modal } from './Modal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from './LoadingSpinner';

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  widgets: any[];
  previewImage?: string;
}

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (template: DashboardTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await requestWithRetry<DashboardTemplate[]>({
        url: '/api/templates',
        method: 'get',
      });
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (selectedTemplate) {
      onApply(selectedTemplate);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Dashboard Template">
      <div className="space-y-4">
        {isLoading ? (
          <LoadingSpinner size="md" message="Loading templates..." />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={loadTemplates} size="sm" className="mt-4">
              Retry
            </Button>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No templates available</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {template.previewImage && (
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {template.widgets.length} widget{template.widgets.length !== 1 ? 's' : ''}
                      </span>
                      {template.widgets.slice(0, 3).map((widget: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        >
                          {widget.type}
                        </span>
                      ))}
                      {template.widgets.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          +{template.widgets.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <div className="text-blue-600 dark:text-blue-400">✓</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedTemplate}
          >
            Apply Template
          </Button>
        </div>
      </div>
    </Modal>
  );
};
