// Blxcker_exe/src/popup.js
// This script controls the popup UI. 
// It reads from and writes to chrome.storage.local to persist settings and stats.

document.addEventListener('DOMContentLoaded', () => {
  const toggleInput = document.getElementById('power-toggle');
  const statusLabel = document.getElementById('status-label');
  const blockedCountDisplay = document.getElementById('blocked-count');
  const resetButton = document.getElementById('reset-stats');

  // 1. Initialize the UI with data from Chrome's persistent storage
  chrome.storage.local.get({ enabled: true, hiddenAdsCount: 0 }, (data) => {
    // Update toggle state
    toggleInput.checked = data.enabled;
    updateStatusLabel(data.enabled);
    
    // Update stats counter
    blockedCountDisplay.textContent = data.hiddenAdsCount;
  });

  // 2. Listen for the user clicking the toggle switch
  toggleInput.addEventListener('change', () => {
    const isEnabled = toggleInput.checked;
    
    // Save the new state to storage. 
    // The background.js script will "hear" this change and turn the blocking rules on/off.
    chrome.storage.local.set({ enabled: isEnabled }, () => {
      updateStatusLabel(isEnabled);
    });
  });

  // 3. Listen for the user clicking the reset button
  resetButton.addEventListener('click', () => {
    chrome.storage.local.set({ hiddenAdsCount: 0 }, () => {
      blockedCountDisplay.textContent = "0";
    });
  });

  // Helper function to update the text under the toggle
  function updateStatusLabel(isEnabled) {
    statusLabel.textContent = isEnabled ? 'Active' : 'Disabled';
    statusLabel.style.color = isEnabled ? '#a0a0a0' : '#ff4d4d'; // Dim gray if active, red if disabled
  }

  // 4. Keep the UI live: listen for storage changes (e.g., content script finds a new ad)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.hiddenAdsCount) {
      // If the content script incremented the counter, update the popup immediately if it's open
      blockedCountDisplay.textContent = changes.hiddenAdsCount.newValue;
    }
  });
});