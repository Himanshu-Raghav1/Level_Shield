import crypto from 'crypto';
import { nanoid } from 'nanoid';

// Sync with backend shared key
const GOOD_BOT_SECRET = 'hackathon-secret-key-12345';

function generateSignature(method: string, path: string, timestamp: string, nonce: string, body = ''): string {
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
  const payload = `${method.toUpperCase()}\n${path}\n${timestamp}\n${nonce}\n${bodyHash}`;
  
  return crypto
    .createHmac('sha256', GOOD_BOT_SECRET)
    .update(payload)
    .digest('hex');
}

async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000';

  console.log(`\n====================================================`);
  console.log(`   SHIELD SIMULATOR: SIGNED GOOD-BOT CRAWLER`);
  console.log(`   Targeting: ${targetUrl}`);
  console.log(`====================================================\n`);

  const botId = 'googlebot-verified';
  const path = '/api/compensation/search';
  const method = 'POST'; // We will hit verified or standard search
  const bodyText = JSON.stringify({ query: 'Google' });

  // 1. Generate signature parameters
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = `nonce_sim_${nanoid(8)}`;
  
  console.log('[Good-Bot] Preparing cryptographic signature headers...');
  const signature = generateSignature(method, path, timestamp, nonce, bodyText);

  console.log(`  -> Bot ID: ${botId}`);
  console.log(`  -> Timestamp: ${timestamp}`);
  console.log(`  -> Nonce: ${nonce}`);
  console.log(`  -> Signature: ${signature}`);

  // 2. Dispatch signed request
  console.log(`\n[Good-Bot] Dispatching signed POST request to ${path}...`);
  try {
    const res = await fetch(`${targetUrl}${path}`, {
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Content-Type': 'application/json',
        'X-Shield-Bot-Id': botId,
        'X-Shield-Timestamp': timestamp,
        'X-Shield-Nonce': nonce,
        'X-Shield-Signature': signature
      },
      body: bodyText
    });

    console.log(`  -> Response Status: ${res.status} (${res.statusText})`);
    
    // Check if the response contains any cookie or verifier outputs
    const body: any = await res.json().catch(() => ({}));
    if (res.status === 200) {
      console.log(`  ✔ [ACCESS GRANTED]: Verification passed successfully!`);
      if (body.results) {
        console.log(`  ✔ Received ${body.results.length} salary results without any anti-scraping challenges.`);
      } else {
        console.log(`  ✔ Response payload:`, JSON.stringify(body).substring(0, 100) + '...');
      }
    } else {
      console.log(`  💥 [ACCESS REJECTED]:`, JSON.stringify(body));
    }
  } catch (err: any) {
    console.error(`  -> Signed request failed: ${err.message}`);
  }

  // 3. Test Nonce Replay Prevention (replay attack)
  console.log(`\n[Good-Bot] Dispatching REPLAY attack using the exact same nonce...`);
  try {
    const res = await fetch(`${targetUrl}${path}`, {
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Content-Type': 'application/json',
        'X-Shield-Bot-Id': botId,
        'X-Shield-Timestamp': timestamp,
        'X-Shield-Nonce': nonce, // Same nonce!
        'X-Shield-Signature': signature
      },
      body: bodyText
    });

    console.log(`  -> Response Status: ${res.status} (${res.statusText})`);
    const body: any = await res.json().catch(() => ({}));
    if (res.status !== 200) {
      console.log(`  ✔ [REPLAY PREVENTED]: Replay request successfully caught and blocked by Shield Nonce Store!`);
      console.log(`  ✔ Block Reason: ${body.error || 'Challenge required / Blocked'}`);
    } else {
      console.log(`  ✘ [SECURITY FAILURE]: Replay request was allowed! Check nonce deduplication store.`);
    }
  } catch (err: any) {
    console.error(`  -> Replay request failed: ${err.message}`);
  }

  console.log(`\n====================================================`);
  console.log(`   SIGNED GOOD-BOT SIMULATION COMPLETE`);
  console.log(`====================================================\n`);
}

main().catch(err => {
  console.error('Good-bot simulation crashed:', err);
  process.exit(1);
});
