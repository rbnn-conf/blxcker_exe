# MiniShield Architecture

This document explains the technical architecture of the MiniShield extension and how the different components interact.

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

### 3. `background.js` (The Service Worker)
In Manifest V3, background scripts have been replaced by Service Workers. They are event-driven and only run when needed, saving memory.

*   Because `declarativeNetRequest` handles the blocking natively, our Service Worker doesn't actively participate in the blocking process.
*   Currently, this file serves as a placeholder. It logs a startup message.
*   In a more complex architecture, this Service Worker would handle things like updating rules dynamically, listening to user clicks on the extension icon, or managing settings.

## Data Flow

1.  **Installation:** User installs the extension. Chrome reads `manifest.json` and parses `rules.json` into its native blocking engine.
2.  **Browsing:** User navigates to `example.com`.
3.  **Request:** `example.com` attempts to load a script from `ad.doubleclick.net`.
4.  **Interception (Native):** Chrome's network stack checks the request against the loaded `declarativeNetRequest` rules.
5.  **Match & Block:** The request matches our rule. Chrome blocks the request at the browser level. The request never reaches the network.
6.  **Background (Idle):** The `background.js` Service Worker remains inactive during this process, consuming no resources.