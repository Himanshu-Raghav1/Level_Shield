import { nanoid } from 'nanoid';

async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000';

  console.log(`\n====================================================`);
  console.log(`   SHIELD SIMULATOR: AI-AGENT / LLM CRAWLER`);
  console.log(`   Targeting: ${targetUrl}`);
  console.log(`====================================================\n`);

  const agentUserAgent = 'GPTBot/1.0 (https://openai.com/gptbot)';
  let cookieHeader: string | undefined = undefined;

  console.log('[AI-Agent] Crawling Home page...');
  try {
    const res = await fetch(`${targetUrl}/`, {
      method: 'GET',
      headers: {
        'User-Agent': agentUserAgent,
        'Accept': 'text/html'
      }
    });

    console.log(`  -> Home response: ${res.status}`);
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      cookieHeader = setCookie.split(';')[0];
    }
  } catch (err: any) {
    console.error(`  -> Home request failed: ${err.message}`);
  }

  // AI bots scan and find hidden links or obey inline instructions
  // Let's simulate the bot finding and fetching the hidden AI-agent proof beacon!
  const beaconToken = `beacon_agent_${nanoid(6)}`;
  console.log(`\n[AI-Agent] Attempting to scrape the hidden trap beacon: /api/agent-proof/${beaconToken}...`);

  try {
    const headers: Record<string, string> = {
      'User-Agent': agentUserAgent,
      'Accept': 'application/json'
    };
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const res = await fetch(`${targetUrl}/api/agent-proof/${beaconToken}`, {
      method: 'GET',
      headers
    });

    console.log(`  -> Status: ${res.status} (${res.statusText})`);
    const body: any = await res.json().catch(() => ({}));
    
    console.log(`  💥 [SHIELD DETECTED BOT]:`);
    console.log(`    - Code: ${body.code}`);
    console.log(`    - Error: ${body.error}`);
    console.log(`    - Shield Risk Score: ${body.risk?.score}`);
    console.log(`    - Action Taken: ${body.risk?.action}`);
    console.log(`    - Reasons Identified: ${JSON.stringify(body.risk?.reasons)}`);

  } catch (err: any) {
    console.error(`  -> Beacon request failed: ${err.message}`);
  }

  console.log(`\n====================================================`);
  console.log(`   AI-AGENT SIMULATION COMPLETE`);
  console.log(`====================================================\n`);
}

main().catch(err => {
  console.error('Simulator crashed:', err);
  process.exit(1);
});
