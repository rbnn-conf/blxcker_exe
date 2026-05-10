# Blxcker_exe 🛡️

A minimal, educational Chrome Extension (Manifest V3) built to demonstrate how to effectively block network requests using the modern `declarativeNetRequest` API.

Currently, MiniShield is configured to block requests to `doubleclick.net` as a simple proof of concept.

## Purpose

This project is designed to be **beginner-friendly**. It serves as a clean, easily understandable template for developers looking to learn about:
*   Chrome Extension Manifest V3 structure.
*   The `declarativeNetRequest` API for ad/tracker blocking.
*   How to structure a professional extension project.

## Project Structure

```text
MiniShield/
├── src/               # The actual Chrome Extension code that gets loaded into the browser.
│   ├── background.js  # Service worker handling background events.
│   ├── manifest.json  # The core configuration file for Chrome.
│   └── rules.json     # The declarative blocking rules.
├── architecture.md    # Explains how the extension works under the hood.
├── roadmap.md         # Future plans and feature ideas.
├── LICENSE            # MIT License.
└── README.md          # You are here!
```

## Setup & Installation Instructions

To try MiniShield in your browser, you need to load it as an "unpacked" extension.

1. **Clone or Download** this repository to your local machine.
2. Open **Google Chrome**.
3. In the address bar, type `chrome://extensions/` and press Enter.
4. Look at the top right corner of the page and turn on **Developer mode**.
5. Three new buttons will appear in the top left. Click **Load unpacked**.
6. A file browser window will open. Navigate to the `MiniShield` folder, select the **`src`** folder inside it, and click "Select Folder" (or "Open").
   > **Note:** It is important to select the `src` folder, as that is where the `manifest.json` lives!
7. MiniShield should now appear in your list of extensions. It is active and blocking requests to doubleclick.net!

## Testing it out

1. Open the Network tab in Chrome Developer Tools (`F12` -> Network).
2. Try navigating to a site that uses DoubleClick ads, or simply type a request to `https://doubleclick.net` in the console.
3. You will see the request blocked (often indicated in red with a status of `(blocked:origin)` or similar), proving the extension is working.

## Contributing

This is an educational project, but feel free to fork, experiment, and submit PRs if you want to improve the documentation or add clear, educational features!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
