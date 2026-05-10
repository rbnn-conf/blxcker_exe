# Blxcker_exe Architecture

This document explains the technical architecture of the Blxcker_exe extension and how the different components interact.

## Core Technologies
*   **Platform:** Google Chrome (Manifest V3)
*   **Language:** Plain JavaScript (Vanilla JS)
*   **Key API:** `chrome.declarativeNetRequest`

## Component Breakdown

The extension logic lives entirely within the `src/` directory.

### 1. `manifest.json` (The Configuration)
This is the entry point for the browser. It declares the extension's identity, permissions, and links the other necessary files.

*   **Manifest Version:** We explicitly use `3`, which is the modern standard for Chrome extensions.
*   **Permissions:** We request the `declarativeNetRequest` permission. This is crucial as it grants us access to the native blocking engine. Note that we *do not* request broad host permissions (like `<all_urls>`), making this extension inherently privacy-respecting.
*   **Declarative Ruleset:** We register `rules.json` as a static rule resource. This tells Chrome to load these rules immediately when the extension is installed.

### 2. `rules.json` (The Blocking Engine)
Instead of writing JavaScript to intercept network requests (which was the old Manifest V2 way), we define our blocking logic declaratively in JSON.

*   Chrome's network stack reads this file natively.
*   When a user navigates to a page, Chrome compares every outbound network request against our rules.
*   If a request matches the `"urlFilter"` (e.g., `||doubleclick.net^`), Chrome executes the defined `"action"` (which is `block`).
*   This process is highly optimized and happens before the request even hits the network, saving bandwidth and improving performance.

### 3. `background.js` (The Service Worker & Filter Engine)
In Manifest V3, background scripts have been replaced by Service Workers. They are event-driven and only run when needed, saving memory.

*   **State Management:** The background script listens for changes to `chrome.storage.local` (e.g., when the user toggles the extension off in the popup) and dynamically enables/disables the static `ruleset_1`.
*   **Custom Filter Engine:** Blxcker_exe includes a lightweight engine that reads a text file (`filters.txt`) formatted with simplified EasyList syntax.
    *   It fetches the file locally.
    *   It parses the text, ignoring comments (`!`).
    *   It converts the strings (like `||domain.com^` or `*ads*`) directly into `declarativeNetRequest` dynamic rules using `chrome.declarativeNetRequest.updateDynamicRules()`.
    *   This demonstrates how ad blockers allow user-defined or remotely-updated blocklists without needing an extension update.

### 4. `content.js` (The Page Modifier)
This script is injected directly into every web page the user visits (as specified in `manifest.json` under `content_scripts`). It operates within the context of the web page and can interact with its Document Object Model (DOM).

*   **Visual Ad Hiding:** The primary role of `content.js` is to identify and hide visible elements on the page that are determined to be advertisements. It does this by maintaining a list of common CSS selectors associated with ads.
*   **Dynamic Content Handling:** Ads often load asynchronously or are injected into the page after the initial load. To handle this, `content.js` utilizes a `MutationObserver`. This API allows the script to efficiently "watch" for changes in the web page's HTML structure. Whenever new elements are added or removed, the observer notifies the script, which then re-runs its ad-hiding logic.
*   **Privacy:** Unlike the `declarativeNetRequest` API, content scripts *do* have access to the web page's DOM. However, this script is designed solely for hiding elements and does not transmit any user data.

## Data Flow

1.  **Installation:** User installs the extension. Chrome reads `manifest.json`, parses `rules.json` into its native blocking engine, and notes that `content.js` should be injected into matching pages.
2.  **Browsing:** User navigates to `example.com`.
3.  **Request:** `example.com` attempts to load a script from `ad.doubleclick.net`.
4.  **Interception (Native):** Chrome's network stack checks the request against the loaded `declarativeNetRequest` rules.
5.  **Match & Block:** The request matches our rule. Chrome blocks the request at the browser level. The request never reaches the network.
6.  **Background (Idle):** The `background.js` Service Worker remains inactive during this process, consuming no resources.