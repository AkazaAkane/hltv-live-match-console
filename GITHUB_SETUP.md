# GitHub Repository Setup Guide

## 🚀 Setting Up Your GitHub Repository

### Step 1: Create a New Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the repository details:
   - **Repository name**: `hltv-live-match-console`
   - **Description**: `Live match tracking, game logs, and scoreboards for HLTV Counter-Strike matches`
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

### Step 2: Connect Your Local Repository

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/hltv-live-match-console.git

# Set the main branch (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

### Step 3: Set Up Repository Features

#### 1. **Issues Template**
Create `.github/ISSUE_TEMPLATE/bug_report.md`:
```markdown
---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 10]
 - VS Code Version: [e.g. 1.90.0]
 - Extension Version: [e.g. 0.3.0]

**Additional context**
Add any other context about the problem here.
```

#### 2. **Pull Request Template**
Create `.github/pull_request_template.md`:
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested the extension locally
- [ ] Verified live match functionality works
- [ ] Checked that all commands are working

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

### Step 4: Configure Repository Settings

#### 1. **Repository Settings**
- Go to **Settings** → **General**
- Enable **Issues** and **Pull requests**
- Set up **Branch protection rules** if needed

#### 2. **Topics and Description**
Add these topics to your repository:
- `vscode-extension`
- `hltv`
- `counter-strike`
- `typescript`
- `playwright`
- `live-tracking`

#### 3. **Social Preview**
- Go to **Settings** → **General** → **Social preview**
- Upload a custom image (recommended: 1280x640px)

### Step 5: Create Releases

#### 1. **Tag Your Release**
```bash
# Create a tag for the current version
git tag -a v0.3.0 -m "Release version 0.3.0"

# Push the tag to GitHub
git push origin v0.3.0
```

#### 2. **Create GitHub Release**
1. Go to **Releases** in your repository
2. Click **"Create a new release"**
3. Select the tag `v0.3.0`
4. Add release notes:
   ```
   ## 🚀 HLTV Live Match Console v0.3.0
   
   ### Features
   - 🔴 Live Match Console with real-time updates
   - 📊 Live Scoreboards with player statistics
   - 🎮 Chronological Game Log with icons
   - 📱 Status Bar integration
   - ⚡ WebSocket support for live data
   
   ### Installation
   Download the `hltv-log-0.3.0.vsix` file and install via VS Code Extensions panel.
   ```
5. Upload the `hltv-log-0.3.0.vsix` file
6. Click **"Publish release"**

### Step 6: Set Up GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Compile TypeScript
      run: npm run compile
    
    - name: Package extension
      run: npx vsce package
    
    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: extension
        path: hltv-log-*.vsix
```

### Step 7: Update Documentation

#### 1. **Update README.md**
Replace `yourusername` in the README with your actual GitHub username:
```bash
# Find and replace in README.md
git clone https://github.com/YOUR_USERNAME/hltv-live-match-console.git
```

#### 2. **Add Badges**
Add these badges to your README.md:
```markdown
![GitHub release (latest by date)](https://img.shields.io/github/v/release/YOUR_USERNAME/hltv-live-match-console)
![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/hltv-live-match-console)
![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/hltv-live-match-console)
```

### Step 8: Push Updates

```bash
# Commit any changes
git add .
git commit -m "Update documentation and setup GitHub features"

# Push to GitHub
git push origin main
```

## 🎉 Congratulations!

Your HLTV Live Match Console repository is now set up with:
- ✅ Professional README with badges
- ✅ Issue and PR templates
- ✅ GitHub Actions CI (optional)
- ✅ Proper licensing
- ✅ Release management
- ✅ Repository topics and description

## 📝 Next Steps

1. **Share your repository** with the community
2. **Create issues** for feature requests and bugs
3. **Accept contributions** from other developers
4. **Maintain and update** the extension regularly

## 🔗 Useful Links

- [GitHub Pages](https://pages.github.com/) - Host documentation
- [GitHub Discussions](https://docs.github.com/en/discussions) - Community forum
- [GitHub Sponsors](https://github.com/sponsors) - Accept donations
- [VS Code Marketplace](https://marketplace.visualstudio.com/) - Publish extension 