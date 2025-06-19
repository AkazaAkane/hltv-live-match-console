# Installing HLTV Live Match Console in Cursor

## Method 1: Install from VSIX File (Recommended)

1. **Download the extension package**
   - The extension has been packaged as: `hltv-log-0.3.0.vsix`
   - This file is located in the project root directory

2. **Install in Cursor**
   - Open Cursor
   - Press `Ctrl+Shift+P` to open Command Palette
   - Type: `Extensions: Install from VSIX...`
   - Select the `hltv-log-0.3.0.vsix` file
   - Click "Install"

3. **Restart Cursor**
   - After installation, restart Cursor to activate the extension

## Method 2: Install from Command Line

```bash
# Navigate to the extension directory
cd "path/to/hltv-log"

# Install the extension globally
code --install-extension hltv-log-0.3.0.vsix
```

## Method 3: Development Installation

```bash
# Clone the repository
git clone <repository-url>
cd hltv-log

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package the extension
npx vsce package

# Install the packaged extension
code --install-extension hltv-log-0.3.0.vsix
```

## Verification

After installation:

1. **Check Extension is Installed**
   - Go to Extensions (`Ctrl+Shift+X`)
   - Search for "HLTV Live Match Console"
   - Should show as installed with version 0.3.0

2. **Test the Extension**
   - Press `Ctrl+Shift+P`
   - Type "HLTV: Start Live Match"
   - Enter a match ID (e.g., `2382614`)
   - Should open the live match console

3. **Check Status Bar**
   - Look for `$(broadcast) HLTV Live` in the status bar
   - Click it to start a live match

## Troubleshooting

**Extension not showing up?**
- Restart Cursor completely
- Check Extensions panel for any error messages
- Try uninstalling and reinstalling

**Commands not found?**
- Make sure the extension is activated
- Check the Output panel for any activation errors
- Verify the extension is listed in Extensions panel

**Browser launch issues?**
- Playwright may need to install browser dependencies
- Run: `npx playwright install` in terminal

**Still seeing old version?**
- Uninstall the old version completely
- Restart Cursor
- Install the new `hltv-log-0.3.0.vsix` file
- Check Extensions panel shows version 0.3.0

## Uninstalling

1. Go to Extensions (`Ctrl+Shift+X`)
2. Find "HLTV Live Match Console"
3. Click the gear icon → "Uninstall"
4. Restart Cursor

## File Location

The packaged extension file is located at:
```
C:\Users\Cronu\Documents\GitHub\hltv plugins\hltv-log\hltv-log-0.3.0.vsix
```

You can copy this file to any location and install it from there. 