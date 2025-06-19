const { chromium } = require('playwright');

async function main() {
  const matchId = process.argv[2] || '2382614'; // Default to a known match if not provided
  const matchUrl = `https://www.hltv.org/matches/${matchId}/_`;
  console.log('Loading HLTV match:', matchUrl);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });

  // Listen for WebSocket frames
  page.on('websocket', ws => {
    console.log('[WS] WebSocket detected:', ws.url());
    ws.on('framereceived', event => {
      try {
        const data = event.payload;
        if (typeof data === 'string') {
          if (data.includes('score') || data.includes('kill') || data.includes('round') || data.includes('log')) {
            console.log('[WS] Frame:', data);
          }
        }
      } catch (e) {
        // Ignore
      }
    });
  });

  // Listen for XHR/fetch responses
  page.on('response', async response => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    if (url.includes('api') || url.includes('scorebot') || url.includes('live') || contentType.includes('json')) {
      try {
        const text = await response.text();
        if (text.includes('score') || text.includes('kill') || text.includes('round') || text.includes('log')) {
          console.log('[XHR]', url, text.substring(0, 200));
        }
      } catch (e) {}
    }
  });

  // Poll the DOM for live data
  async function pollDom() {
    try {
      const data = await page.evaluate(() => {
        // Get the scorebot element which contains all live data
        const scorebot = document.querySelector('.scorebot');
        
        // Get team names from the scoreboard
        const team1Name = document.querySelector('.ctTeamHeaderBg .teamName')?.textContent?.trim() || 'Team 1';
        const team2Name = document.querySelector('.tTeamHeaderBg .teamName')?.textContent?.trim() || 'Team 2';
        
        // Get current scores from the score display
        const ctScore = document.querySelector('.ctScore')?.textContent?.trim() || '0';
        const tScore = document.querySelector('.tScore')?.textContent?.trim() || '0';
        
        // Get current round info
        const currentRound = document.querySelector('.currentRoundText')?.textContent?.trim() || 'Unknown';
        const roundText = document.querySelector('.roundText')?.textContent?.trim() || 'Unknown';
        
        // Get map name from the background image or round text
        const mapElement = document.querySelector('.currentRoundText');
        const map = mapElement?.textContent?.includes('dust2') ? 'dust2' : 
                   mapElement?.textContent?.includes('mirage') ? 'mirage' : 
                   mapElement?.textContent?.includes('inferno') ? 'inferno' : 'Unknown';
        
        // Get live game log entries from the gamelog container
        const gameLogEntries = [];
        const gamelogContainer = document.querySelector('.gamelog .list');
        if (gamelogContainer) {
          const logElements = gamelogContainer.querySelectorAll('.gamelogBox');
          logElements.forEach((el, index) => {
            if (index < 10) { // Get last 10 entries
              const text = el.textContent?.trim();
              const className = el.className;
              let type = 'other';
              
              if (className.includes('playerKill')) type = 'kill';
              else if (className.includes('roundStart')) type = 'round_start';
              else if (className.includes('winner')) type = 'round_end';
              else if (className.includes('quitGame')) type = 'quit';
              else if (className.includes('bomb')) type = 'bomb';
              
              if (text && text.length > 5) {
                gameLogEntries.push({ text, type, className });
              }
            }
          });
        }
        
        // Get player stats from the scoreboard tables
        const scoreboardData = {};
        
        // CT team stats
        const ctPlayers = document.querySelectorAll('.ctPlayerBg');
        ctPlayers.forEach(row => {
          const playerName = row.querySelector('.nameCell')?.textContent?.trim();
          const kills = row.querySelector('.killCell')?.textContent?.trim();
          const deaths = row.querySelector('.deathCell')?.textContent?.trim();
          const assists = row.querySelector('.assistCell')?.textContent?.trim();
          const adr = row.querySelector('.adrCell')?.textContent?.trim();
          const money = row.querySelector('.moneyCell')?.textContent?.trim();
          const hp = row.querySelector('.hp-text')?.textContent?.trim();
          
          if (playerName) {
            scoreboardData[playerName] = { 
              kills, deaths, assists, adr, money, hp, team: 'CT' 
            };
          }
        });
        
        // T team stats
        const tPlayers = document.querySelectorAll('.tPlayerBg');
        tPlayers.forEach(row => {
          const playerName = row.querySelector('.nameCell')?.textContent?.trim();
          const kills = row.querySelector('.killCell')?.textContent?.trim();
          const deaths = row.querySelector('.deathCell')?.textContent?.trim();
          const assists = row.querySelector('.assistCell')?.textContent?.trim();
          const adr = row.querySelector('.adrCell')?.textContent?.trim();
          const money = row.querySelector('.moneyCell')?.textContent?.trim();
          const hp = row.querySelector('.hp-text')?.textContent?.trim();
          
          if (playerName) {
            scoreboardData[playerName] = { 
              kills, deaths, assists, adr, money, hp, team: 'T' 
            };
          }
        });
        
        // Get round history
        const roundHistory = [];
        const historyIcons = document.querySelectorAll('.historyIcon img');
        historyIcons.forEach(icon => {
          const src = icon.src;
          if (src.includes('ct_win')) roundHistory.push('CT');
          else if (src.includes('t_win')) roundHistory.push('T');
          else if (src.includes('bomb_exploded')) roundHistory.push('Bomb Exploded');
          else if (src.includes('bomb_defused')) roundHistory.push('Bomb Defused');
          else if (src.includes('stopwatch')) roundHistory.push('Time Expired');
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
      console.log('[DOM]', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[DOM Error]', e.message);
    }
  }

  await page.goto(matchUrl, { waitUntil: 'networkidle' });
  console.log('Page loaded. Polling for live data...');

  // Poll every 3 seconds for 1 minute
  for (let i = 0; i < 20; ++i) {
    await pollDom();
    await new Promise(r => setTimeout(r, 3000));
  }

  await browser.close();
  console.log('Done.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 