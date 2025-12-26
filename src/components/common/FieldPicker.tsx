'use client';

/**
 * FieldPicker Component
 * Allows users to select which API fields to display in widgets
 */

import React, { useEffect, useState } from 'react';
import { fetchApiSchema, FieldSchema, getDefaultFields } from '@/utils/apiSchema';
import { LoadingSpinner } from './LoadingSpinner';

interface FieldPickerProps {
  provider: 'alpha' | 'finnhub';
  symbol: string;
  widgetType: 'finance-card' | 'line-chart' | 'table';
  selectedFields: string[];
  onChange: (fields: string[]) => void;
}

export const FieldPicker: React.FC<FieldPickerProps> = ({
  provider,
  symbol,
  widgetType,
  selectedFields,
  onChange,
}) => {
  const [fields, setFields] = useState<FieldSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!symbol || !isExpanded) return;

    const loadSchema = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const schemaType = widgetType === 'line-chart' ? 'history' : widgetType === 'table' ? 'table' : 'quote';
        const schema = await fetchApiSchema(provider, symbol, schemaType);
        setFields(schema.fields);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fields');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchema();
  }, [provider, symbol, widgetType, isExpanded]);

  const handleToggleField = (fieldPath: string) => {
    if (selectedFields.includes(fieldPath)) {
      onChange(selectedFields.filter((f) => f !== fieldPath));
    } else {
      onChange([...selectedFields, fieldPath]);
    }
  };

  const handleUseDefaults = () => {
    const defaults = getDefaultFields(widgetType);
    onChange(defaults);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Display Fields
        </label>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isExpanded ? 'Collapse' : 'Customize Fields'}
        </button>
      </div>

      {isExpanded && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          {isLoading ? (
            <LoadingSpinner size="sm" message="Loading available fields..." />
          ) : error ? (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : fields.length === 0 ? (
            <div className="text-sm text-gray-500">
              No fields available. Try entering a valid symbol first.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select fields to display in your widget:
                </p>
                <button
                  type="button"
                  onClick={handleUseDefaults}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Use Defaults
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1">
                {fields.map((field) => (
                  <label
                    key={field.path}
                    className="flex items-start gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.path)}
                      onChange={() => handleToggleField(field.path)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {field.path}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {field.type}
                        </span>
                      </div>
                      {field.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {field.description}
                        </p>
                      )}
                      {field.example !== undefined && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          Example: {String(field.example)}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Selected: {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!isExpanded && selectedFields.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected: {selectedFields.join(', ')}
        </div>
      )}
    </div>
  );
};
