# MiniShield Roadmap 🗺️

This document outlines the planned future features and improvements for MiniShield. The goal is to evolve the extension from a simple proof-of-concept into a more feature-rich, yet still educational, project.

## Phase 1: Foundation (Current)
*   [x] Basic Manifest V3 structure.
*   [x] Static blocking using `declarativeNetRequest`.
*   [x] Professional GitHub repository structure and documentation.

## Phase 2: User Interface & Interaction
*   **Action Popup (`popup.html` & `popup.js`):**
    *   Add a simple popup when the user clicks the extension icon.
    *   Display a visual indicator showing if the shield is currently "Active" or "Disabled".
    *   Show a stat counter (e.g., "Requests blocked this session" - this will require tracking events in the Service Worker).
*   **Toggle Functionality:**
    *   Allow the user to turn the blocking rules on and off via a button in the popup. This will involve using the `chrome.declarativeNetRequest.updateEnabledRulesets` API.

## Phase 3: Dynamic Rules & Customization
*   **Options Page (`options.html` & `options.js`):**
    *   Create a settings page where users can manage their own rules.
*   **Custom Blocklist:**
    *   Allow users to input their own domains to block.
    *   Implement `declarativeNetRequestWithHostAccess` to dynamically add user-defined rules using `chrome.declarativeNetRequest.updateDynamicRules`.
*   **Allowlisting (Whitelisting):**
    *   Allow users to specify domains where blocking should be completely disabled.

## Phase 4: Advanced Features (Educational Goals)
*   **Rule Subscription:** Demonstrate how to fetch a JSON file of rules from a remote server periodically and update the dynamic ruleset.
*   **Cosmetic Filtering (Content Scripts):** While `declarativeNetRequest` blocks network requests, some ads are baked into the HTML. Introduce content scripts to hide specific DOM elements (e.g., hiding a `<div>` with the class `ad-banner`).
*   **Build Pipeline:** Introduce a simple build step (e.g., using Webpack or Rollup) to bundle the project, minify code, and prepare it for the Chrome Web Store, moving beyond the raw "unpacked" workflow.