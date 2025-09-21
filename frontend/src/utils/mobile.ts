/**
 * Mobile optimization utilities
 */

// Device detection
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

// Touch support detection
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Network information (if available)
export const getNetworkInfo = () => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) {
    return null;
  }
  
  return {
    effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
    downlink: connection.downlink, // Mbps
    rtt: connection.rtt, // ms
    saveData: connection.saveData // boolean
  };
};

// Performance optimizations for mobile
export const optimizeForMobile = () => {
  // Disable hover effects on touch devices
  if (isTouchDevice()) {
    document.documentElement.classList.add('touch-device');
  }
  
  // Add mobile-specific classes
  if (isMobile()) {
    document.documentElement.classList.add('mobile-device');
  }
  
  if (isIOS()) {
    document.documentElement.classList.add('ios-device');
  }
  
  if (isAndroid()) {
    document.documentElement.classList.add('android-device');
  }
  
  // Optimize for slow connections
  const networkInfo = getNetworkInfo();
  if (networkInfo?.saveData || networkInfo?.effectiveType === 'slow-2g' || networkInfo?.effectiveType === '2g') {
    document.documentElement.classList.add('slow-connection');
  }
};

// Viewport utilities
export const getViewportSize = () => {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  };
};

export const isLandscape = (): boolean => {
  const { width, height } = getViewportSize();
  return width > height;
};

// Safe area utilities for notched devices
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
  };
};

// Haptic feedback (if available)
export const vibrate = (pattern: number | number[] = 100) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Image optimization for mobile
export const getOptimizedImageUrl = (url: string, _width: number, _quality: number = 80): string => {
  // This would integrate with an image optimization service
  // For now, return the original URL
  return url;
};

// Lazy loading intersection observer
export const createLazyLoadObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };
  
  return new IntersectionObserver(callback, options);
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
    });
  } else {
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
};

// Memory usage monitoring (if available)
export const getMemoryUsage = () => {
  const memory = (performance as any).memory;
  
  if (!memory) {
    return null;
  }
  
  return {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
  };
};

// Battery API (if available)
export const getBatteryInfo = async () => {
  const battery = await (navigator as any).getBattery?.();
  
  if (!battery) {
    return null;
  }
  
  return {
    level: Math.round(battery.level * 100), // percentage
    charging: battery.charging,
    chargingTime: battery.chargingTime,
    dischargingTime: battery.dischargingTime
  };
};

// PWA installation prompt
export let deferredPrompt: any = null;

export const setupPWAInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
  });
};

export const showPWAInstallPrompt = async () => {
  if (!deferredPrompt) {
    return false;
  }
  
  // Show the prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  
  // Clear the deferredPrompt
  deferredPrompt = null;
  
  return outcome === 'accepted';
};

export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};