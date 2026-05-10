// Blxcker_exe/src/content.js
// This script detects and hides ad containers.
// It has been heavily optimized to reduce CPU/Memory impact and prevent page jank.

// ==========================================
// 1. Constants
// ==========================================
// We use more specific selectors. Broad selectors like [class*="ad"] are incredibly 
// slow because the browser has to check the class string of EVERY element on the page.
const AD_SELECTORS = [
  '.advertisement',    
  '.promo',
  '.ad-banner',
  '#ad-sidebar',
  'iframe[src*="doubleclick"]',
  'iframe[src*="ads"]'
];

const AD_QUERY_STRING = AD_SELECTORS.join(', ');

// ==========================================
// 2. Utility: Debouncing
// ==========================================
/**
 * Limits how often a function can fire. 
 * Crucial for MutationObservers, which can fire hundreds of times a second.
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==========================================
// 3. Main Ad Blocker Logic
// ==========================================
class AdBlocker {
  constructor() {
    this.isActive = false;
    
    // We bind the context and wrap the hideAds function in a debounce.
    // If the DOM changes 50 times in 100ms, hideAds only runs ONCE at the end.
    this.debouncedHideAds = debounce(this.hideAds.bind(this), 150);
    
    this.observer = new MutationObserver(this.onMutation.bind(this));
    
    // Cache the storage API call to avoid repeated asynchronous reads/writes in hot paths
    this.hiddenAdsSessionCount = 0;
  }

  /**
   * Scans a specific DOM node (or the whole document) for ad elements and hides them.
   * @param {Node} rootNode - The node to scan. Defaults to document.
   */
  hideAds(rootNode = document) {
    if (!this.isActive) return;

    try {
      // Optimization: Only query within the provided rootNode.
      // If a single div was added, we only search inside that div, not the whole page.
      const elements = rootNode.querySelectorAll(AD_QUERY_STRING);
      let newlyHiddenCount = 0;
      
      // Optimization: Convert NodeList to Array for slightly faster iteration in some engines,
      // but standard forEach is usually fine. The bigger optimization is avoiding style recalculations.
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        
        // Browsers trigger a slow "layout recalculation" if you read styles and then write styles.
        // We use a CSS class to hide things instead of inline styles. 
        // This is much faster and cleaner.
        if (!el.classList.contains('blxcker-hidden')) {
          el.classList.add('blxcker-hidden');
          newlyHiddenCount++;
        }
      }

      // Batch storage updates to prevent disk I/O bottlenecks
      if (newlyHiddenCount > 0) {
        this.hiddenAdsSessionCount += newlyHiddenCount;
        this.syncStatsToStorage();
      }
    } catch (error) {
      console.error('Blxcker_exe Error:', error);
    }
  }

  /**
   * Syncs the local session count to Chrome storage. 
   * Wrapped in a debounce so we don't spam the disk if 100 ads load at once.
   */
  syncStatsToStorage = debounce(() => {
    chrome.storage.local.get({ hiddenAdsCount: 0 }, (data) => {
      chrome.storage.local.set({ 
        hiddenAdsCount: data.hiddenAdsCount + this.hiddenAdsSessionCount 
      });
      this.hiddenAdsSessionCount = 0; // Reset session count after sync
    });
  }, 1000);

  /**
   * Callback fired by MutationObserver.
   */
  onMutation(mutations) {
    if (!this.isActive) return;

    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        
        // Instead of scanning the whole document every time, we ideally want to 
        // only scan the nodes that were just added.
        // However, scanning multiple small nodes can sometimes be slower than one big scan.
        // For simplicity and to catch edge cases, we debounce a global scan.
        this.debouncedHideAds(); 
        break; // Only need to trigger the debounced scan once per mutation batch
      }
    }
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;
    
    // Inject the CSS class we use for hiding elements
    if (!document.getElementById('blxcker-styles')) {
      const style = document.createElement('style');
      style.id = 'blxcker-styles';
      style.textContent = '.blxcker-hidden { display: none !important; opacity: 0 !important; pointer-events: none !important; }';
      document.head.appendChild(style);
    }

    this.hideAds(document); 
    
    // Optimization: We only watch for direct additions. We don't care about attribute changes.
    this.observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false, 
      characterData: false 
    });
  }

  stop() {
    this.isActive = false;
    this.observer.disconnect();
  }
}

// ==========================================
// 4. Initialization
// ==========================================
const blocker = new AdBlocker();

chrome.storage.local.get({ enabled: true }, (data) => {
  if (data.enabled) blocker.start();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.enabled !== undefined) {
    if (changes.enabled.newValue) {
      blocker.start();
    } else {
      blocker.stop();
    }
  }
});
