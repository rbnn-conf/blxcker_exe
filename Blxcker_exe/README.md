# Blxcker_exe 🛡️

A minimal, educational Chrome Extension (Manifest V3) built to demonstrate how to effectively block network requests using the modern `declarativeNetRequest` API.

Currently, Blxcker_exe is configured to block requests to `doubleclick.net` as a simple proof of concept and hide visible ads using a content script.

## Purpose

This project is designed to be **beginner-friendly**. It serves as a clean, easily understandable template for developers looking to learn about:
*   Chrome Extension Manifest V3 structure.
*   The `declarativeNetRequest` API for network request blocking.
*   Content scripts for modifying web page content (e.g., hiding visual elements).
*   How to structure a professional extension project.

## Project Structure

```text
Blxcker_exe/
├── src/               # The actual Chrome Extension code that gets loaded into the browser.
│   ├── background.js  # Service worker handling background events.
│   ├── content.js     # Script injected into web pages to hide visible ad elements.
│   ├── manifest.json  # The core configuration file for Chrome.
│   └── rules.json     # The declarative blocking rules.
├── architecture.md    # Explains how the extension works under the hood.
├── roadmap.md         # Future plans and feature ideas.
├── LICENSE            # MIT License.
└── README.md          # You are here!
```

## Setup & Installation Instructions

To try Blxcker_exe in your browser, you need to load it as an "unpacked" extension.

1. **Clone or Download** this repository to your local machine.
2. Open **Google Chrome**.
3. In the address bar, type `chrome://extensions/` and press Enter.
4. Look at the top right corner of the page and turn on **Developer mode**.
5. Three new buttons will appear in the top left. Click **Load unpacked**.
6. A file browser window will open. Navigate to the `MiniShield` folder, select the **`src`** folder inside it, and click "Select Folder" (or "Open").
   > **Note:** It is important to select the `src` folder, as that is where the `manifest.json` lives!
7. Blxcker_exe should now appear in your list of extensions. It is active and blocking requests to doubleclick.net and attempting to hide visible ads!

## Testing it out

1. Open the Network tab in Chrome Developer Tools (`F12` -> Network).
2. Try navigating to a site that uses DoubleClick ads, or simply type a request to `https://doubleclick.net` in the console.
3. You will see the request blocked (often indicated in red with a status of `(blocked:origin)` or similar), proving the network request blocking is working.

### Testing the Content Script (Visual Ad Hiding)

1. Navigate to a website known to display ads (e.g., a news site or blog with ad banners).
2. Open Chrome Developer Tools (`F12`).
3. Check the Console tab; you should see the message "Blxcker_exe content script started and observing DOM for ads."
4. Observe the page for common ad elements (banners, sidebars). The content script attempts to hide these elements by applying `display: none !important;` to them. You might see elements disappear shortly after the page loads or after new content is added.

## Contributing

This is an educational project, but feel free to fork, experiment, and submit PRs if you want to improve the documentation or add clear, educational features!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.