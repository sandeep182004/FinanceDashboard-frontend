/**
 * Dashboard Configuration Utilities
 * Export/Import/Save/Load dashboard configurations
 */

import { requestWithRetry } from '@/services/api';

export interface DashboardConfig {
  widgets: any[];
  layout: any;
  theme?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Export entire dashboard configuration
 * GET /api/config/export/all
 */
export const exportDashboardConfig = async (): Promise<DashboardConfig> => {
  try {
    const data = await requestWithRetry<DashboardConfig>({
      url: '/api/config/export/all',
      method: 'get',
    });
    return data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to export config: ${msg}`);
  }
};

/**
 * Download dashboard configuration as JSON file
 */
export const downloadDashboardConfig = (config: DashboardConfig, filename = 'dashboard-config.json') => {
  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import and merge dashboard configuration
 * POST /api/config/import/merge
 */
export const importDashboardConfig = async (config: DashboardConfig): Promise<DashboardConfig> => {
  try {
    const data = await requestWithRetry<DashboardConfig>({
      url: '/api/config/import/merge',
      method: 'post',
      data: config,
    });
    return data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to import config: ${msg}`);
  }
};

/**
 * Read JSON file from file input
 */
export const readConfigFile = (file: File): Promise<DashboardConfig> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const config = JSON.parse(text);
        resolve(config);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Save dashboard configuration with specific ID
 * POST /api/config/{id}
 */
export const saveDashboardConfig = async (id: string, config: DashboardConfig): Promise<void> => {
  try {
    await requestWithRetry({
      url: `/api/config/${id}`,
      method: 'post',
      data: config,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save config: ${msg}`);
  }
};

/**
 * Load dashboard configuration by ID
 * GET /api/config/{id}
 */
export const loadDashboardConfig = async (id: string): Promise<DashboardConfig> => {
  try {
    const data = await requestWithRetry<DashboardConfig>({
      url: `/api/config/${id}`,
      method: 'get',
    });
    return data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load config: ${msg}`);
  }
};

/**
 * List all saved configurations
 * GET /api/config/list
 */
export const listDashboardConfigs = async (): Promise<{ id: string; name: string; updatedAt: number }[]> => {
  try {
    const data = await requestWithRetry<{ id: string; name: string; updatedAt: number }[]>({
      url: '/api/config/list',
      method: 'get',
    });
    return data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to list configs: ${msg}`);
  }
};
