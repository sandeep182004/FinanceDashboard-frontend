'use client';

/**
 * useWebSocketQuote Hook
 * Manages WebSocket connection for real-time stock quotes
 * Replaces HTTP polling with WebSocket events
 */

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Quote {
  provider: string;
  symbol: string;
  price: number;
  change: number | null;
  changePercent: number | null;
  timestamp: number;
}

interface UseWebSocketQuoteOptions {
  symbol: string;
  provider?: string;
  enabled?: boolean;
  intervalMs?: number;
}

// Global socket instance
let globalSocket: Socket | null = null;

function getSocket(): Socket {
  if (!globalSocket) {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';
    globalSocket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });
  }
  return globalSocket;
}

export const useWebSocketQuote = ({
  symbol,
  provider = 'alpha',
  enabled = true,
  intervalMs = 10000
}: UseWebSocketQuoteOptions) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !symbol) return;

    const socket = getSocket();
    
    // Update connection state
    setIsConnected(socket.connected);

    const handleQuote = (data: Quote) => {
      console.log('[Socket] Received quote:', data);
      if (data.symbol.toUpperCase() === symbol.toUpperCase()) {
        setQuote(data);
        setError(null);
      }
    };

    const handleConnect = () => {
      console.log('[Socket] Connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
    };

    // Register listeners
    socket.on('quote', handleQuote);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Subscribe
    console.log(`[Socket] Subscribing to ${symbol}`);
    socket.emit('subscribe', {
      symbol: symbol.toUpperCase(),
      provider,
      intervalMs
    });

    // Cleanup
    return () => {
      console.log(`[Socket] Unsubscribing from ${symbol}`);
      socket.emit('unsubscribe', {
        symbol: symbol.toUpperCase(),
        provider
      });
      socket.off('quote', handleQuote);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [symbol, provider, enabled, intervalMs]);

  return { data: quote, error, isConnected, quote };
};
