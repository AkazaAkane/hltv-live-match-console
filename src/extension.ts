import * as vscode from 'vscode';
import { chromium, Browser, Page } from 'playwright';

interface GameLogEntry {
  text: string;
  type: 'kill' | 'round_start' | 'round_end' | 'quit' | 'bomb' | 'suicide' | 'other';
  className: string;
  timestamp: Date;
}

interface PlayerStats {
  kills: string;
  deaths: string;
  assists: string;
  adr: string;
  money: string;
  hp: string;
  team: 'CT' | 'T';
}

interface MatchData {
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  map: string;
  round: string;
  currentRound: string;
  gameLogEntries: GameLogEntry[];
  scoreboardData: { [playerName: string]: PlayerStats };
  roundHistory: string[];
  hasScorebot: boolean;
}

let browser: Browser | null = null;
let outputChannel: vscode.OutputChannel | null = null;
let statusBarItem: vscode.StatusBarItem | null = null;
let updateInterval: NodeJS.Timeout | null = null;
let currentMatchData: MatchData | null = null;

export function activate(ctx: vscode.ExtensionContext) {
  console.log('HLTV Live Match Console extension is now active!');

  // Create output channel
  outputChannel = vscode.window.createOutputChannel('HLTV Live Match');
  
  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'hltvlog.openLive';
  statusBarItem.text = '$(broadcast) HLTV Live';
  statusBarItem.tooltip = 'Start HLTV Live Match';
  statusBarItem.show();

  // Register commands
  ctx.subscriptions.push(
    vscode.commands.registerCommand('hltvlog.openLive', startLiveMatch),
    vscode.commands.registerCommand('hltvlog.stopLive', stopLiveMatch),
    vscode.commands.registerCommand('hltvlog.copyLog', copyLogToClipboard),
    vscode.commands.registerCommand('hltvlog.clearLog', clearLog),
    outputChannel,
    statusBarItem
  );
}

async function startLiveMatch() {
  const userInput = await vscode.window.showInputBox({
    prompt: 'Enter HLTV match URL or ID',
    placeHolder: 'e.g. 2382614 or https://www.hltv.org/matches/2382614/...',
    value: '2382614' // Default for testing
  });

  if (!userInput) return;

  const matchIdMatch = userInput.match(/(\d{6,})/);
  if (!matchIdMatch) {
    return vscode.window.showErrorMessage('Could not find a valid match ID.');
  }

  const matchId = matchIdMatch[1];
  
  // Stop any existing match
  await stopLiveMatch();
  
  // Show and clear output channel
  outputChannel?.show(true);
  outputChannel?.clear();
  
  writeHeader('🔴 STARTING HLTV LIVE MATCH CONSOLE');
  writeInfo(`Match ID: ${matchId}`);
  writeInfo('Launching browser and connecting to HLTV...');

  try {
    await startPlaywrightScraper(matchId);
  } catch (error: any) {
    writeError(`Failed to start live match: ${error.message}`);
    vscode.window.showErrorMessage(`Failed to start live match: ${error.message}`);
  }
}

async function stopLiveMatch() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  
  if (browser) {
    await browser.close();
    browser = null;
  }
  
  if (statusBarItem) {
    statusBarItem.text = '$(broadcast) HLTV Live';
    statusBarItem.tooltip = 'Start HLTV Live Match';
  }
  
  currentMatchData = null;
  writeInfo('🔴 Live match stopped');
}

async function startPlaywrightScraper(matchId: string) {
  browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });

  // Listen for WebSocket frames
  page.on('websocket', ws => {
    if (ws.url().includes('scorebot')) {
      writeInfo('🔗 Connected to HLTV scorebot WebSocket');
      ws.on('framereceived', event => {
        try {
          const data = event.payload;
          if (typeof data === 'string' && (data.includes('score') || data.includes('kill') || data.includes('round') || data.includes('log'))) {
            writeWebSocketData(data);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      });
    }
  });

  // Listen for XHR/fetch responses
  page.on('response', async response => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    if (url.includes('scorebot') || url.includes('live') || contentType.includes('json')) {
      try {
        const text = await response.text();
        if (text.includes('score') || text.includes('kill') || text.includes('round') || text.includes('log')) {
          writeWebSocketData(`XHR: ${text.substring(0, 100)}...`);
        }
      } catch (e) {
        // Ignore
      }
    }
  });

  const matchUrl = `https://www.hltv.org/matches/${matchId}/_`;
  await page.goto(matchUrl, { waitUntil: 'networkidle' });
  
  writeInfo('✅ HLTV page loaded successfully');
  writeInfo('🔍 Searching for live scorebot data...');

  // Start polling for live data
  updateInterval = setInterval(async () => {
    try {
      const data = await extractLiveData(page);
      if (data) {
        updateMatchDisplay(data);
      }
    } catch (error) {
      console.error('Error extracting live data:', error);
    }
  }, 3000);

  // Initial data extraction
  const initialData = await extractLiveData(page);
  if (initialData) {
    updateMatchDisplay(initialData);
  }
}

async function extractLiveData(page: Page): Promise<MatchData | null> {
  try {
    return await page.evaluate(() => {
      // Get the scorebot element which contains all live data
      const scorebot = document.querySelector('.scorebot');
      
      // Get team names from the new scoreboard structure
      const team1Name = document.querySelector('.ctTeamHeaderBg .teamName')?.textContent?.trim() || 'Team 1';
      const team2Name = document.querySelector('.tTeamHeaderBg .teamName')?.textContent?.trim() || 'Team 2';
      
      // Get current scores from the new score display
      const ctScore = document.querySelector('.ctScore')?.textContent?.trim() || '0';
      const tScore = document.querySelector('.tScore')?.textContent?.trim() || '0';
      
      // Get current round info from the new structure
      const currentRoundElement = document.querySelector('.currentRoundText');
      const currentRound = currentRoundElement?.textContent?.trim() || 'Unknown';
      const roundText = document.querySelector('.roundText')?.textContent?.trim() || 'Unknown';
      
      // Get map name from the round text
      const mapText = currentRoundElement?.textContent || '';
      const map = mapText.includes('dust2') ? 'dust2' : 
                 mapText.includes('mirage') ? 'mirage' : 
                 mapText.includes('inferno') ? 'inferno' : 
                 mapText.includes('ancient') ? 'ancient' :
                 mapText.includes('vertigo') ? 'vertigo' :
                 mapText.includes('nuke') ? 'nuke' :
                 mapText.includes('overpass') ? 'overpass' : 'Unknown';
      
      // Get live game log entries from the new gamelog structure
      const gameLogEntries: any[] = [];
      const gamelogContainer = document.querySelector('.list.desktop');
      if (gamelogContainer) {
        const logElements = gamelogContainer.querySelectorAll('.gamelogBox');
        logElements.forEach((el, index) => {
          if (index < 20) { // Get last 20 entries
            const text = el.textContent?.trim();
            const className = el.className;
            let type = 'other';
            
            if (className.includes('playerKill')) type = 'kill';
            else if (className.includes('roundStart')) type = 'round_start';
            else if (className.includes('winner')) type = 'round_end';
            else if (className.includes('quitGame')) type = 'quit';
            else if (className.includes('bombPlant') || className.includes('bomb')) type = 'bomb';
            else if (className.includes('playerSuicide')) type = 'suicide';
            
            if (text && text.length > 3) {
              gameLogEntries.push({ 
                text, 
                type, 
                className,
                timestamp: new Date()
              });
            }
          }
        });
      }
      
      // Get player stats from the new scoreboard structure
      const scoreboardData: any = {};
      
      // CT team stats - using the new table structure
      const ctPlayers = document.querySelectorAll('.ctPlayerBg');
      ctPlayers.forEach(row => {
        const playerName = row.querySelector('.nameCell')?.textContent?.trim();
        const kills = row.querySelector('.killCell')?.textContent?.trim() || '0';
        const deaths = row.querySelector('.deathCell')?.textContent?.trim() || '0';
        const assists = row.querySelector('.assistCell')?.textContent?.trim() || '0';
        const adr = row.querySelector('.adrCell')?.textContent?.trim() || '0';
        const moneyElement = row.querySelector('.moneyCell');
        const money = moneyElement?.textContent?.replace('$', '').trim() || '0';
        const hpElement = row.querySelector('.hp-text');
        const hp = hpElement?.textContent?.trim() || '100';
        
        if (playerName) {
          scoreboardData[playerName] = { 
            kills, deaths, assists, adr, money, hp, team: 'CT' 
          };
        }
      });
      
      // T team stats - using the new table structure
      const tPlayers = document.querySelectorAll('.tPlayerBg');
      tPlayers.forEach(row => {
        const playerName = row.querySelector('.nameCell')?.textContent?.trim();
        const kills = row.querySelector('.killCell')?.textContent?.trim() || '0';
        const deaths = row.querySelector('.deathCell')?.textContent?.trim() || '0';
        const assists = row.querySelector('.assistCell')?.textContent?.trim() || '0';
        const adr = row.querySelector('.adrCell')?.textContent?.trim() || '0';
        const moneyElement = row.querySelector('.moneyCell');
        const money = moneyElement?.textContent?.replace('$', '').trim() || '0';
        const hpElement = row.querySelector('.hp-text');
        const hp = hpElement?.textContent?.trim() || '100';
        
        if (playerName) {
          scoreboardData[playerName] = { 
            kills, deaths, assists, adr, money, hp, team: 'T' 
          };
        }
      });
      
      // Get round history from the new structure
      const roundHistory: string[] = [];
      const historyIcons = document.querySelectorAll('.historyIcon img');
      historyIcons.forEach(icon => {
        const src = (icon as HTMLImageElement).src;
        if (src.includes('ct_win')) roundHistory.push('CT');
        else if (src.includes('t_win')) roundHistory.push('T');
        else if (src.includes('bomb_exploded')) roundHistory.push('💣');
        else if (src.includes('bomb_defused')) roundHistory.push('🔧');
        else if (src.includes('stopwatch')) roundHistory.push('⏰');
      });

      return { 
        team1: team1Name, 
        team2: team2Name, 
        score1: ctScore, 
        score2: tScore, 
        map, 
        round: roundText,
        currentRound,
        gameLogEntries,
        scoreboardData,
        roundHistory: roundHistory.slice(-15), // Last 15 rounds
        hasScorebot: !!scorebot
      };
    });
  } catch (error) {
    console.error('Error extracting live data:', error);
    return null;
  }
}

function updateMatchDisplay(data: MatchData) {
  const wasFirstUpdate = !currentMatchData;
  const previousLogCount = currentMatchData?.gameLogEntries.length || 0;
  currentMatchData = data;

  // Update status bar
  if (statusBarItem) {
    statusBarItem.text = `$(broadcast) ${data.team1} ${data.score1}:${data.score2} ${data.team2}`;
    statusBarItem.tooltip = `${data.team1} vs ${data.team2} on ${data.map} - Round ${data.currentRound}`;
  }

  if (wasFirstUpdate) {
    // First update - show full match info
    writeMatchHeader(data);
    writeScoreboard(data);
    writeGameLog(data.gameLogEntries);
  } else {
    // Subsequent updates - only show new log entries
    const newEntries = data.gameLogEntries.slice(0, data.gameLogEntries.length - previousLogCount);
    if (newEntries.length > 0) {
      newEntries.reverse().forEach(entry => writeLogEntry(entry));
    }
    
    // Update scoreboard every 5th update (15 seconds)
    if (Math.random() < 0.2) {
      writeScoreboard(data);
    }
  }
}

function writeMatchHeader(data: MatchData) {
  const separator = '═'.repeat(80);
  outputChannel?.appendLine('');
  outputChannel?.appendLine(separator);
  outputChannel?.appendLine(`🏆 ${data.team1.toUpperCase()} vs ${data.team2.toUpperCase()}`);
  outputChannel?.appendLine(`📍 Map: ${data.map.toUpperCase()} | Round: ${data.currentRound} | Score: ${data.score1} - ${data.score2}`);
  if (data.roundHistory.length > 0) {
    outputChannel?.appendLine(`📊 Recent rounds: ${data.roundHistory.join(' ')}`);
  }
  outputChannel?.appendLine(separator);
  outputChannel?.appendLine('');
}

function writeScoreboard(data: MatchData) {
  const separator = '─'.repeat(80);
  outputChannel?.appendLine('');
  outputChannel?.appendLine('📊 LIVE SCOREBOARD');
  outputChannel?.appendLine(separator);
  
  // CT Team
  outputChannel?.appendLine(`🔵 ${data.team1.toUpperCase()} (CT) - ${data.score1}`);
  outputChannel?.appendLine('┌─────────────┬────┬────┬────┬─────┬────────┬────┐');
  outputChannel?.appendLine('│ Player      │ K  │ D  │ A  │ ADR │ Money  │ HP │');
  outputChannel?.appendLine('├─────────────┼────┼────┼────┼─────┼────────┼────┤');
  
  Object.entries(data.scoreboardData)
    .filter(([_, stats]) => stats.team === 'CT')
    .forEach(([name, stats]) => {
      const truncName = name.length > 11 ? name.substring(0, 8) + '...' : name.padEnd(11);
      const kills = stats.kills.padStart(2);
      const deaths = stats.deaths.padStart(2);
      const assists = stats.assists.padStart(2);
      const adr = stats.adr.padStart(5);
      const money = stats.money.padStart(6);
      const hp = stats.hp.padStart(2);
      outputChannel?.appendLine(`│ ${truncName} │ ${kills} │ ${deaths} │ ${assists} │ ${adr} │ ${money} │ ${hp} │`);
    });
  
  outputChannel?.appendLine('└─────────────┴────┴────┴────┴─────┴────────┴────┘');
  outputChannel?.appendLine('');
  
  // T Team
  outputChannel?.appendLine(`🔴 ${data.team2.toUpperCase()} (T) - ${data.score2}`);
  outputChannel?.appendLine('┌─────────────┬────┬────┬────┬─────┬────────┬────┐');
  outputChannel?.appendLine('│ Player      │ K  │ D  │ A  │ ADR │ Money  │ HP │');
  outputChannel?.appendLine('├─────────────┼────┼────┼────┼─────┼────────┼────┤');
  
  Object.entries(data.scoreboardData)
    .filter(([_, stats]) => stats.team === 'T')
    .forEach(([name, stats]) => {
      const truncName = name.length > 11 ? name.substring(0, 8) + '...' : name.padEnd(11);
      const kills = stats.kills.padStart(2);
      const deaths = stats.deaths.padStart(2);
      const assists = stats.assists.padStart(2);
      const adr = stats.adr.padStart(5);
      const money = stats.money.padStart(6);
      const hp = stats.hp.padStart(2);
      outputChannel?.appendLine(`│ ${truncName} │ ${kills} │ ${deaths} │ ${assists} │ ${adr} │ ${money} │ ${hp} │`);
    });
  
  outputChannel?.appendLine('└─────────────┴────┴────┴────┴─────┴────────┴────┘');
  outputChannel?.appendLine('');
}

function writeGameLog(entries: GameLogEntry[]) {
  outputChannel?.appendLine('🎮 LIVE GAME LOG');
  outputChannel?.appendLine('─'.repeat(80));
  
  // Show entries in reverse chronological order (newest first)
  entries.slice().reverse().forEach(entry => writeLogEntry(entry));
  outputChannel?.appendLine('');
}

function writeLogEntry(entry: GameLogEntry) {
  const time = new Date().toLocaleTimeString();
  let icon = '•';
  let color = '';
  
  switch (entry.type) {
    case 'kill':
      icon = '🔫';
      break;
    case 'round_end':
      icon = '🏁';
      break;
    case 'round_start':
      icon = '▶️';
      break;
    case 'bomb':
      icon = '💣';
      break;
    case 'quit':
      icon = '❌';
      break;
    case 'suicide':
      icon = '💀';
      break;
  }
  
  outputChannel?.appendLine(`${time} ${icon} ${entry.text}`);
}

function writeHeader(message: string) {
  outputChannel?.appendLine('');
  outputChannel?.appendLine('═'.repeat(80));
  outputChannel?.appendLine(message);
  outputChannel?.appendLine('═'.repeat(80));
  outputChannel?.appendLine('');
}

function writeInfo(message: string) {
  const time = new Date().toLocaleTimeString();
  outputChannel?.appendLine(`${time} ℹ️  ${message}`);
}

function writeError(message: string) {
  const time = new Date().toLocaleTimeString();
  outputChannel?.appendLine(`${time} ❌ ${message}`);
}

function writeWebSocketData(data: string) {
  const time = new Date().toLocaleTimeString();
  outputChannel?.appendLine(`${time} 🔗 ${data}`);
}

async function copyLogToClipboard() {
  if (!currentMatchData) {
    vscode.window.showWarningMessage('No live match data to copy');
    return;
  }
  
  const logText = currentMatchData.gameLogEntries
    .slice(0, 50) // Last 50 entries
    .reverse()
    .map(entry => `${entry.type.toUpperCase()}: ${entry.text}`)
    .join('\n');
    
  await vscode.env.clipboard.writeText(logText);
  vscode.window.showInformationMessage('Last 50 log entries copied to clipboard');
}

function clearLog() {
  outputChannel?.clear();
  if (currentMatchData) {
    writeMatchHeader(currentMatchData);
  }
}

export function deactivate() {
  stopLiveMatch();
}