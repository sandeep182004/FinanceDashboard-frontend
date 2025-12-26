/**
 * API Schema Utilities
 * Fetch and parse API response schemas for field selection
 */

import { requestWithRetry } from '@/services/api';

export interface FieldSchema {
  path: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  example?: any;
}

export interface ApiSchema {
  provider: string;
  symbol: string;
  type: string;
  fields: FieldSchema[];
}

/**
 * Fetch API response schema
 * GET /api/utils/schema?provider={provider}&symbol={symbol}&type={type}
 */
export const fetchApiSchema = async (
  provider: 'alpha' | 'finnhub',
  symbol: string,
  type: 'quote' | 'history' | 'table'
): Promise<ApiSchema> => {
  try {
    const data = await requestWithRetry<ApiSchema>({
      url: '/api/utils/schema',
      method: 'get',
      params: { provider, symbol: symbol.toUpperCase(), type },
    });
    return data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch schema: ${msg}`);
  }
};

/**
 * Extract field value from nested object using dot notation path
 * Example: getFieldValue({ a: { b: { c: 10 } } }, 'a.b.c') => 10
 */
export const getFieldValue = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
};

/**
 * Format field value based on type
 */
export const formatFieldValue = (value: any, type: string): string => {
  if (value === null || value === undefined) return 'N/A';
  
  switch (type) {
    case 'number':
      // Check if it's likely a currency value
      if (Math.abs(value) > 0.01 && Math.abs(value) < 100000) {
        return `$${value.toFixed(2)}`;
      }
      return value.toFixed(2);
      
    case 'boolean':
      return value ? 'Yes' : 'No';
      
    case 'string':
      return String(value);
      
    case 'object':
    case 'array':
      return JSON.stringify(value);
      
    default:
      return String(value);
  }
};

/**
 * Get default fields for a widget type
 */
export const getDefaultFields = (widgetType: string): string[] => {
  switch (widgetType) {
    case 'finance-card':
      return ['price', 'change', 'changePercent', 'timestamp'];
      
    case 'line-chart':
      return ['timestamp', 'price'];
      
    case 'table':
      return ['symbol', 'price', 'change', 'changePercent'];
      
    default:
      return ['price', 'change', 'changePercent'];
  }
};
