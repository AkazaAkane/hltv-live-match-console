const HLTV = require('hltv').default;

async function testHLTV() {
  console.log('Testing HLTV API...\n');
  
  const matchId = 2382614; // Spirit vs MOUZ match
  
  try {
    // Test 1: Get match info
    console.log('1. Testing getMatch...');
    const matchInfo = await HLTV.getMatch({ id: matchId });
    console.log('✅ Match info received:');
    console.log(`   Teams: ${matchInfo.team1.name} vs ${matchInfo.team2.name}`);
    console.log(`   Event: ${matchInfo.event.name}`);
    console.log(`   Status: ${matchInfo.status}`);
    console.log(`   Format: ${matchInfo.format}`);
    console.log(`   Date: ${new Date(matchInfo.date).toLocaleString()}`);
    console.log('');
    
    // Test 2: Connect to scorebot
    console.log('2. Testing connectToScorebot...');
    console.log('   Connecting to scorebot (this may take a moment)...');
    
    let updateCount = 0;
    const socket = await HLTV.connectToScorebot({
      id: matchId,
      onScoreboard: (sb) => {
        updateCount++;
        console.log(`✅ Scoreboard update #${updateCount}:`);
        console.log(`   CT: ${sb.ctTeamName} (${sb.ctScore})`);
        console.log(`   T: ${sb.tTeamName} (${sb.tScore})`);
        console.log(`   Map: ${sb.map}, Round: ${sb.currentRound}, Phase: ${sb.roundPhase}`);
        console.log('');
      },
      onFullLog: (logs) => {
        console.log(`✅ Full log received (${logs.length} entries):`);
        logs.slice(0, 5).forEach((log, i) => {
          console.log(`   ${i + 1}. ${log}`);
        });
        if (logs.length > 5) {
          console.log(`   ... and ${logs.length - 5} more entries`);
        }
        console.log('');
      },
      onLog: (logs) => {
        console.log(`✅ Log update received (${logs.length} entries):`);
        logs.forEach((log, i) => {
          console.log(`   ${i + 1}. ${log}`);
        });
        console.log('');
      }
    });
    
    console.log('✅ Scorebot connection established successfully!');
    console.log('   Waiting for updates... (press Ctrl+C to stop)');
    
    // Keep the connection alive for 30 seconds
    setTimeout(() => {
      console.log('\n⏰ 30 seconds elapsed. Closing connection...');
      if (socket && typeof socket.close === 'function') {
        socket.close();
      }
      console.log('✅ Test completed!');
      process.exit(0);
    }, 30000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testHLTV(); 