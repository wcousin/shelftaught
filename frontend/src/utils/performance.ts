// Performance monitoring utilities

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('page-load-time', navEntry.loadEventEnd - navEntry.fetchStart);
              this.recordMetric('dom-content-loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
              this.recordMetric('first-paint', navEntry.loadEventStart - navEntry.fetchStart);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error);
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              if (resourceEntry.name.includes('curriculum') || resourceEntry.name.includes('search')) {
                this.recordMetric(`api-${resourceEntry.name.split('/').pop()}`, resourceEntry.duration);
              }
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource timing observer not supported:', error);
      }

      // Observe largest contentful paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('largest-contentful-paint', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // Observe first input delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as any; // PerformanceEventTiming not available in all browsers
            if (fidEntry.processingStart) {
              this.recordMetric('first-input-delay', fidEntry.processingStart - entry.startTime);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }
  }

  recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now()
    };
    
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
    
    // Log slow operations
    if (name.includes('api') && value > 2000) {
      console.warn(`Slow API call detected: ${name} took ${value}ms`);
    }
    
    if (name === 'largest-contentful-paint' && value > 2500) {
      console.warn(`Slow LCP detected: ${value}ms`);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / relevantMetrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Utility functions for manual performance tracking
export const measureAsync = async <T>(
  name: string,
  asyncFn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await asyncFn();
    const duration = performance.now() - start;
    performanceMonitor.recordMetric(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric(`${name}-error`, duration);
    throw error;
  }
};

export const measureSync = <T>(
  name: string,
  syncFn: () => T
): T => {
  const start = performance.now();
  try {
    const result = syncFn();
    const duration = performance.now() - start;
    performanceMonitor.recordMetric(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric(`${name}-error`, duration);
    throw error;
  }
};

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  performanceMonitor.disconnect();
});

export default performanceMonitor;