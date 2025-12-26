import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Quote {
  provider: string;
  symbol: string;
  price: number;
  change: number | null;
  changePercent: number | null;
  timestamp: number;
}

interface UseStockSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

/**
 * Hook to manage Socket.IO connection and subscribe to live stock quotes.
 * Automatically handles connection setup, cleanup, and state management.
 */
export const useStockSocket = (options: UseStockSocketOptions = {}) => {
  const {
    url = 'http://localhost:4001',
    autoConnect = true
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    // Initialize Socket.IO connection
    const socket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected:', socket.id);
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected');
      setConnected(false);
    });

    socket.on('quote', (payload: Quote) => {
      console.log('[Socket.IO] Quote received:', payload);
      setQuotes((prev) => ({
        ...prev,
        [payload.symbol]: payload
      }));
    });

    socket.on('error', (err: any) => {
      console.error('[Socket.IO] Error:', err);
      setError(err.message || 'Socket.IO error');
    });

    socket.on('connect_error', (err: any) => {
      console.error('[Socket.IO] Connection error:', err);
      setError(`Connection failed: ${err.message}`);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, autoConnect]);

  const subscribe = (symbol: string, provider = 'alpha', intervalMs = 10000) => {
    if (!socketRef.current) {
      console.warn('Socket.IO not connected yet');
      return;
    }
    console.log('[Socket.IO] Subscribing to', symbol, 'via', provider);
    socketRef.current.emit('subscribe', { symbol, provider, intervalMs });
  };

  const unsubscribe = (symbol: string, provider = 'alpha') => {
    if (!socketRef.current) return;
    console.log('[Socket.IO] Unsubscribing from', symbol);
    socketRef.current.emit('unsubscribe', { symbol, provider });
  };

  const getQuote = (symbol: string): Quote | null => {
    return quotes[symbol.toUpperCase()] || null;
  };

  return {
    connected,
    error,
    quotes,
    subscribe,
    unsubscribe,
    getQuote
  };
};
