// Immediate fix for service worker issues
console.log('🔧 Fixing service worker and API issues...');

// 1. Unregister service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('✅ Service worker unregistered');
    }
  });
}

// 2. Clear all caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
      console.log('✅ Cache cleared:', name);
    }
  });
}

// 3. Clear localStorage and sessionStorage
localStorage.clear();
sessionStorage.clear();
console.log('✅ Storage cleared');

// 4. Force reload
setTimeout(() => {
  console.log('🔄 Reloading page...');
  location.reload();
}, 1000);