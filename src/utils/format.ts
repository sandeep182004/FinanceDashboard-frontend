export const formatCurrency = (
  value: number | null | undefined,
  options: { currency?: string; locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';
  const { currency = 'USD', locale = 'en-US', minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(Number(value));
  } catch {
    return `$${Number(value).toFixed(Math.max(minimumFractionDigits, 0))}`;
  }
};

export const formatPercent = (
  value: number | null | undefined,
  options: { locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number; showSign?: boolean } = {}
): string => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';
  const { locale = 'en-US', minimumFractionDigits = 2, maximumFractionDigits = 2, showSign = true } = options;
  const n = Number(value);
  const sign = showSign && n > 0 ? '+' : '';
  try {
    // Intl percent expects fraction values (0.123 => 12.3%), but our inputs are already percent.
    const formatted = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(n / 100);
    return `${sign}${formatted}`;
  } catch {
    return `${sign}${n.toFixed(Math.max(minimumFractionDigits, 0))}%`;
  }
};

export const formatNumber = (
  value: number | null | undefined,
  options: { locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number; showSign?: boolean } = {}
): string => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';
  const { locale = 'en-US', minimumFractionDigits = 2, maximumFractionDigits = 2, showSign = false } = options;
  const n = Number(value);
  const sign = showSign && n > 0 ? '+' : '';
  try {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(n);
    return `${sign}${formatted}`;
  } catch {
    return `${sign}${n.toFixed(Math.max(minimumFractionDigits, 0))}`;
  }
};

export const formatDateTime = (
  timestamp: number | string | Date | null | undefined,
  options: { locale?: string; dateStyle?: Intl.DateTimeFormatOptions['dateStyle']; timeStyle?: Intl.DateTimeFormatOptions['timeStyle'] } = {}
): string => {
  if (!timestamp) return 'N/A';
  const { locale = 'en-US', dateStyle = 'medium', timeStyle = 'short' } = options;
  try {
    const dt = typeof timestamp === 'number' || typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return new Intl.DateTimeFormat(locale, { dateStyle, timeStyle }).format(dt as Date);
  } catch {
    try {
      return new Date(timestamp as any).toLocaleString();
    } catch {
      return String(timestamp);
    }
  }
};
