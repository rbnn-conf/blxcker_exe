// background.js
// This is the background service worker for the MiniShield extension.
// In Manifest V3, service workers run in the background and handle events.
// For declarativeNetRequest, the browser handles blocking natively based on rules.json,
// so we don't strictly need to write blocking logic here.
// However, it's good practice to have this file for future event handling or debugging.

console.log("MiniShield background service worker started. Blocking doubleclick.net...");
