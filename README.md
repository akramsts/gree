<div align="center">

<img src="browser-192.png" width="96" height="96" alt="Browser logo">

# Browser

**Privacy-first start page. Fast search, clean UI, local history, and offline installability.**

No tracking · No ads · No analytics

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Supported Search Engines](#supported-search-engines)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Pages](#pages)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Privacy](#privacy)
- [Trademarks](#trademarks)
- [License](#license)
- [Author](#author)

---

## Overview

Browser is a lightweight, installable start page built with plain HTML, CSS, and JavaScript. It delivers a distraction-free search experience, lets users choose a preferred search engine, and stores settings and history entirely in the browser.

This app is designed for speed, privacy, and simplicity.

## Features

- Clean, distraction-free search interface
- URL detection: type a URL and navigate directly
- Local search history with grouping, filtering, and deletion
- Smart suggestion dropdown from recent searches
- Search engine picker: logo button in the search box opens a popup with all 7 engines
- Light / Dark / System theme support
- Installable PWA with offline caching
- Dedicated pages for settings, history, and about
- Responsive design for mobile and desktop

## Supported Search Engines

- DuckDuckGo (default)
- Startpage
- Brave
- Ecosia
- Bing
- Yahoo
- Google

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- `localStorage` for preferences and history
- Service Worker for offline caching
- Web App Manifest for installability

## Project Structure

```
browser/
├── index.html            # Main search start page
├── settings.html         # Theme preferences
├── history.html          # Full search history with filtering and delete
├── about.html            # App info and version details
├── style.css             # Styles for the main search page
├── pages.css             # Shared styles for secondary pages
├── script.js             # Search and history logic
├── theme.js              # Theme detection and switching
├── engines.js            # Search engine list (name, URL, logo) - single source of truth
├── utils.js              # Shared helpers: storage, history, URL detection, HTML escaping
├── logos/                # Engine logos (SVG), one file per engine id in engines.js
├── browser-sw.js         # Service worker (offline caching)
├── browser-manifest.json # PWA manifest
├── browser-192.png       # App icon (192x192)
├── browser-512.png       # App icon (512x512)
└── README.md
```

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/akramsts/browser.git
cd browser
```

2. Run a local static server:

```bash
npx serve .
```

3. Open the served site in your browser.

> For full PWA and service worker support, use a local server or HTTPS host. Opening `index.html` directly with `file:///` may disable offline features.

## Usage

- Type a query and press `Enter` to search.
- Type a URL to open it directly.
- Press `Shift + Enter` to open search in a new tab.
- Click the engine logo in the search box to change the search engine.
- Manage search history in `history.html`.
- Install the app from the browser prompt.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `↑` / `↓` | Cycle through search history suggestions |
| `Enter` | Search |
| `Shift + Enter` | Open search in a new tab |
| `Ctrl/Cmd + K` | Focus the search box |
| `Ctrl/Cmd + L` | Focus and select the search box |
| `Esc` | Clear input / close open menus |

## Pages

| Page | Description |
|---|---|
| `index.html` | Main search start page |
| `settings.html` | Choose theme |
| `history.html` | View and manage search history |
| `about.html` | App information and credits |

## How It Works

- **Search / URL detection** — input is parsed as a URL when it matches URL-like patterns. Otherwise the app searches using the selected engine.
- **Local history** — searches are saved in `localStorage` as entries with `id`, `query`, `time`, and `engine`. `utils.js` is the only place that reads and writes them.
- **Theme system** — `theme.js` applies light, dark, or system theme and keeps it synced across tabs.
- **Offline support** — `browser-sw.js` pre-caches core pages, styles, scripts, and icons so the app can load offline after first visit.

## Deployment

This is a static web app and can be hosted on any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Any static file server

## Privacy

- Settings (theme, search engine) and search history are stored only in your browser's `localStorage`.
- The app has no backend, no accounts, no analytics and no tracking.
- When you search, your query is sent to the search engine you selected. That engine's own privacy policy applies.
- You can delete individual history entries or clear everything from the History page.

## Trademarks

Search engine names and logos (DuckDuckGo, Startpage, Brave, Ecosia, Bing, Yahoo, Google) are trademarks of their respective owners. This project is independent and is not affiliated with or endorsed by any of them. Logos are shown only to identify each search engine.

## License

The source code is available for personal and educational use. Feel free to fork and customize it for your own start page. Search engine logos are not covered by this license; see [Trademarks](#trademarks).

## Author

Made by **Akram**