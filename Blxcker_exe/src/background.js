// Blxcker_exe/src/background.js
// This Service Worker handles global events and our custom Filter Engine.

// Initialize default settings and load custom filters on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ enabled: true, hiddenAdsCount: 0 }, (data) => {
    chrome.storage.local.set(data);
    updateStaticRulesetState(data.enabled);
    
    if (data.enabled) {
      loadAndApplyCustomFilters();
    }
  });
});

// Listen for changes in settings (e.g., from the popup toggle)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.enabled !== undefined) {
    const isEnabled = changes.enabled.newValue;
    updateStaticRulesetState(isEnabled);
    
    if (isEnabled) {
      loadAndApplyCustomFilters();
    } else {
      clearCustomFilters();
    }
    console.log(`Blxcker_exe: Extension ${isEnabled ? 'enabled' : 'disabled'}`);
  }
});

/**
 * Turns the static declarativeNetRequest rules (from rules.json) on or off.
 */
function updateStaticRulesetState(isEnabled) {
  chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: isEnabled ? ["ruleset_1"] : [],
    disableRulesetIds: isEnabled ? [] : ["ruleset_1"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Blxcker_exe Error updating static rules:', chrome.runtime.lastError);
    }
  });
}

// ==========================================
// Filter Engine (Custom EasyList Parser)
// ==========================================

/**
 * Fetches the local filters.txt file and parses it into dynamic rules.
 */
async function loadAndApplyCustomFilters() {
  try {
    const response = await fetch(chrome.runtime.getURL('filters.txt'));
    const text = await response.text();
    
    const rules = parseFilterList(text);
    
    // Apply the newly parsed rules dynamically
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(rule => rule.id), // Clear old rules with same IDs to prevent errors
      addRules: rules
    });
    
    console.log(`Blxcker_exe: Successfully loaded ${rules.length} custom filters.`);
  } catch (error) {
    console.error('Blxcker_exe Error loading custom filters:', error);
  }
}

/**
 * Removes all dynamically added custom filters.
 */
async function clearCustomFilters() {
  try {
    // In a real scenario, you'd track the IDs you added. 
    // Here we retrieve existing dynamic rules and remove them.
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds
    });
    console.log('Blxcker_exe: Cleared custom filters.');
  } catch (error) {
    console.error('Blxcker_exe Error clearing custom filters:', error);
  }
}

/**
 * Parses a simplified EasyList-style text document into declarativeNetRequest rules.
 * @param {string} filterText - The raw text from filters.txt
 * @returns {Array} Array of declarativeNetRequest rule objects
 */
function parseFilterList(filterText) {
  const lines = filterText.split('\n');
  const dnrRules = [];
  
  // Dynamic rules need unique IDs. We start from 1000 to avoid conflicting 
  // with static rules in rules.json (which might use lower IDs like 1).
  let ruleIdCounter = 1000; 

  for (let line of lines) {
    line = line.trim();

    // 1. Ignore empty lines and comments (lines starting with '!')
    if (!line || line.startsWith('!')) {
      continue;
    }

    // 2. Parse the rule logic
    let urlFilter = line;

    // A simplified conversion from EasyList to declarativeNetRequest syntax.
    // DNR natively supports standard EasyList domain matching like '||example.com^'
    // and wildcard matching like '*ads*', so we can often just pass the string directly as a urlFilter.
    
    // Create the DNR rule object
    const rule = {
      id: ruleIdCounter++,
      priority: 1,
      action: { type: 'block' },
      condition: {
        urlFilter: urlFilter,
        // Block these request types by default
        resourceTypes: ["main_frame", "sub_frame", "script", "image", "xmlhttprequest", "ping"]
      }
    };

    dnrRules.push(rule);
  }

  return dnrRules;
}
