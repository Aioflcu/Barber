// src/serviceWorkerRegistration.js
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('SW registered:', reg);
          reg.onupdatefound = () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.onstatechange = () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New content available; please refresh.');
                }
              };
            }
          };
        })
        .catch((err) => console.warn('SW registration failed:', err));
    });
  } else {
    console.log('SW not supported');
  }
}
