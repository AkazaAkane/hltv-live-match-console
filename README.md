# HLTV Live Match Console

A VS Code extension that provides real-time live match tracking, game logs, and scoreboards for HLTV Counter-Strike matches.

![HLTV Live Match Console](https://img.shields.io/badge/Version-0.3.0-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-Extension-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue.svg)

## 🚀 Features

🔴 **Live Match Console** - Real-time text-based match tracking  
📊 **Live Scoreboards** - Player stats, money, health, and performance  
🎮 **Chronological Game Log** - Kill feeds, round events, and match progression  
📱 **Status Bar Integration** - Live score updates in your status bar  
⚡ **WebSocket Support** - Direct connection to HLTV scorebot data  

## 📦 Installation

### From VSIX Package

1. Download the latest `hltv-log-0.3.0.vsix` from releases
2. Open VS Code/Cursor
3. Press `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
4. Select the downloaded VSIX file
5. Restart VS Code/Cursor

### From Source

```bash
# Clone the repository
git clone https://github.com/yourusername/hltv-live-match-console.git
cd hltv-live-match-console

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package the extension
npx vsce package

# Install the extension
code --install-extension hltv-log-0.3.0.vsix
```

## 🎮 Usage

### Starting a Live Match

1. **Command Palette**: `Ctrl+Shift+P` → `HLTV: Start Live Match`
2. **Status Bar**: Click the `$(broadcast) HLTV Live` button
3. Enter a match ID (e.g., `2382614`) or full HLTV URL

### Example Output

```
════════════════════════════════════════════════════════════════════════════════
🔴 STARTING HLTV LIVE MATCH CONSOLE
════════════════════════════════════════════════════════════════════════════════

10:30:15 ℹ️  Match ID: 2382614
10:30:15 ℹ️  Launching browser and connecting to HLTV...
10:30:18 ℹ️  ✅ HLTV page loaded successfully
10:30:18 ℹ️  🔍 Searching for live scorebot data...

════════════════════════════════════════════════════════════════════════════════
🏆 SPIRIT vs MOUZ
📍 Map: DUST2 | Round: R: 22 - dust2 | Score: 9 - 13
📊 Recent rounds: ⏰ CT CT 🔧 🔧 🔧 🔧 CT CT 🔧 💣 T 💣 T T
════════════════════════════════════════════════════════════════════════════════

📊 LIVE SCOREBOARD
────────────────────────────────────────────────────────────────────────────────
🔵 SPIRIT (CT) - 9
┌─────────────┬────┬────┬────┬─────┬────────┬────┐
│ Player      │ K  │ D  │ A  │ ADR │ Money  │ HP │
├─────────────┼────┼────┼────┼─────┼────────┼────┤
│ donk        │ 23 │ 16 │  5 │121.0│   $150 │  0 │
│ magixx      │ 15 │ 15 │  5 │ 86.6│  $1050 │  0 │
│ sh1ro       │ 11 │ 12 │  1 │ 47.4│   $500 │  0 │
│ chopper     │  7 │ 15 │  0 │ 32.0│    $50 │  0 │
│ zont1x      │  6 │ 15 │  5 │ 55.3│   $850 │  0 │
└─────────────┴────┴────┴────┴─────┴────────┴────┘

🔴 MOUZ (T) - 13
┌─────────────┬────┬────┬────┬─────┬────────┬────┐
│ Player      │ K  │ D  │ A  │ ADR │ Money  │ HP │
├─────────────┼────┼────┼────┼─────┼────────┼────┤
│ Jimpphat    │ 18 │ 10 │  5 │ 90.0│  $2200 │100 │
│ xertioN     │ 17 │ 15 │  5 │ 80.9│   $550 │  0 │
│ Brollan     │ 16 │ 14 │  5 │ 75.8│  $1850 │  0 │
│ Spinx       │ 16 │ 11 │  0 │ 74.8│  $3600 │100 │
│ torzsi      │  6 │ 12 │  3 │ 42.7│   $400 │100 │
└─────────────┴────┴────┴────┴─────┴────────┴────┘

🎮 LIVE GAME LOG
────────────────────────────────────────────────────────────────────────────────
10:30:25 🔫 Spinx + Brollan  magixx
10:30:24 🔫 Spinx + xertioN  sh1ro
10:30:23 🔫 Jimpphat  chopper
10:30:22 🔫 Spinx  donk
10:30:21 🔫 Spinx  zont1x
10:30:20 🔫 magixx  Brollan
10:30:19 🔫 magixx  xertioN
10:30:18 ▶️ Round started
10:30:17 🏁 Round over - Winner: T (13 - 9) - Enemy eliminated
10:30:16 ❌ sh1ro quit the game
10:30:15 ❌ magixx quit the game
```

### Available Commands

- `HLTV: Start Live Match` - Start tracking a live match
- `HLTV: Stop Live Match` - Stop the current live match
- `HLTV: Copy Game Log` - Copy last 50 log entries to clipboard
- `HLTV: Clear Console` - Clear the output console

### Status Bar

The status bar shows live score updates:
- `$(broadcast) HLTV Live` - Ready to start
- `$(broadcast) Spirit 9:13 MOUZ` - Live match with score

## ⚙️ Configuration

Open VS Code Settings (`Ctrl+,`) and search for "HLTV":

- `hltvlog.pollInterval` - Update frequency (1000-10000ms, default: 3000)
- `hltvlog.showScoreboard` - Show scoreboard updates (default: true)
- `hltvlog.hideEventTypes` - Hide specific event types from log

## 🛠️ Development

### Prerequisites

- Node.js 16+ 
- npm or yarn
- VS Code or Cursor

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/hltv-live-match-console.git
cd hltv-live-match-console

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Compile TypeScript
npm run compile

# Watch for changes (development)
npm run watch
```

### Testing

```bash
# Run in VS Code Extension Development Host
F5 (Run Extension)

# Package for distribution
npx vsce package

# Install locally
code --install-extension hltv-log-0.3.0.vsix
```

### Project Structure

```
hltv-live-match-console/
├── src/
│   └── extension.ts          # Main extension code
├── syntaxes/
│   └── hltv.tmLanguage.json  # HLTV log syntax highlighting
├── language-configuration.json
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript configuration
└── README.md
```

## 🔧 How It Works

1. **Playwright Browser** - Launches headless browser to access HLTV
2. **WebSocket Detection** - Connects to HLTV's live scorebot WebSocket
3. **DOM Scraping** - Extracts live data from HLTV's React scoreboard
4. **Real-time Updates** - Polls every 3 seconds for new data
5. **Text Formatting** - Displays formatted output in VS Code Output Channel

## 📊 Supported Match Data

- ✅ Live scores and round counts
- ✅ Player statistics (K/D/A, ADR, money, health)
- ✅ Kill feed with weapons and assists
- ✅ Round history and outcomes
- ✅ Bomb events (plant/defuse/explode)
- ✅ Player connections/disconnections
- ✅ Map information

## 🐛 Troubleshooting

**Extension not activating?**
- Check the Output panel for error messages
- Ensure you have internet connection

**No live data showing?**
- Verify the match ID is correct and the match is live
- Some matches may not have live scorebot data
- Try a different match ID

**Browser fails to launch?**
- Playwright may need to install browser dependencies
- Run `npx playwright install` in the terminal

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [HLTV](https://www.hltv.org/) for providing live match data
- [Playwright](https://playwright.dev/) for browser automation
- [VS Code Extension API](https://code.visualstudio.com/api) for the extension framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [Issues](../../issues)
3. Create a new issue with detailed information

---

**Made with ❤️ for the Counter-Strike community** 