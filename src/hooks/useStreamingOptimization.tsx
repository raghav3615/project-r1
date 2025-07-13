import { useCallback, useRef } from 'react';

interface StreamingOptimizationConfig {
  throttleMs?: number;
  maxBatchSize?: number;
}

export function useStreamingOptimization(
  onUpdate: (content: string) => void,
  config: StreamingOptimizationConfig = {}
) {
  const { throttleMs = 50, maxBatchSize = 10 } = config;
  const lastUpdateTime = useRef(0);
  const updateTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const pendingContent = useRef('');
  const batchCount = useRef(0);

  const flushUpdate = useCallback(() => {
    if (pendingContent.current) {
      onUpdate(pendingContent.current);
      lastUpdateTime.current = Date.now();
      updateTimeoutId.current = null;
      batchCount.current = 0;
    }
  }, [onUpdate]);

  const queueUpdate = useCallback((content: string) => {
    pendingContent.current = content;
    batchCount.current++;
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    
    // Cancel any existing timeout
    if (updateTimeoutId.current) {
      clearTimeout(updateTimeoutId.current);
    }
    
    // Flush immediately if enough time has passed or we've batched enough updates
    if (timeSinceLastUpdate >= throttleMs || batchCount.current >= maxBatchSize) {
      flushUpdate();
    } else {
      // Schedule an update for later
      updateTimeoutId.current = setTimeout(flushUpdate, throttleMs - timeSinceLastUpdate);
    }
  }, [flushUpdate, throttleMs, maxBatchSize]);

  const forceFlush = useCallback(() => {
    if (updateTimeoutId.current) {
      clearTimeout(updateTimeoutId.current);
    }
    flushUpdate();
  }, [flushUpdate]);

  const cleanup = useCallback(() => {
    if (updateTimeoutId.current) {
      clearTimeout(updateTimeoutId.current);
      updateTimeoutId.current = null;
    }
    pendingContent.current = '';
    batchCount.current = 0;
  }, []);

  return {
    queueUpdate,
    forceFlush,
    cleanup,
  };
}
