import { db } from '../src/lib/store/db';
import { createOrGetSession, insertRequestEvent, insertBehaviorEvent } from '../src/lib/store/events';
import { evaluateSessionRisk } from '../src/lib/security/risk-engine';
import { generateGoodBotSignature, verifyGoodBotSignature } from '../src/lib/security/good-bot';
import { setSessionGoodBot } from '../src/lib/store/sessionStore';
import { nanoid } from 'nanoid';

// Console colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function runTests() {
  console.log(`${BOLD}====================================================`);
  console.log(`   LEVEL SHIELD SECURITY RISK ENGINE VERIFICATION`);
  console.log(`====================================================${RESET}\n`);

  // --- TEST 1: Normal User returns ALLOW ---
  console.log(`${BOLD}[TEST 1] Verifying Normal User Session...${RESET}`);
  const normalSessionId = `test_normal_${nanoid(6)}`;
  
  // Create normal session
  const normalHeaders = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'sec-ch-ua-platform': '"macOS"',
    'referer': 'http://localhost:3000/'
  };
  
  createOrGetSession(
    normalSessionId, 
    normalHeaders['user-agent'], 
    '127.0.0.1', 
    '"macOS"'
  );

  // Insert standard navigation
  insertRequestEvent(normalSessionId, '/', 'GET', '');
  insertRequestEvent(normalSessionId, '/compensation', 'GET', 'http://localhost:3000/');
  
  // Submit human telemetry
  insertBehaviorEvent(normalSessionId, 'telemetry_submission', {
    mouseMoves: [
      { x: 100, y: 100, t: 10 },
      { x: 150, y: 200, t: 50 },
      { x: 220, y: 310, t: 100 }
    ],
    scrolls: [{ y: 150, t: 50 }],
    screenSize: { width: 1440, height: 900 },
    timezone: 'America/New_York'
  });

  const normalRisk = evaluateSessionRisk(normalSessionId, normalHeaders, '/compensation', 'GET');
  console.log(`- Risk Score: ${normalRisk.score}`);
  console.log(`- Defense Action: ${normalRisk.action}`);
  console.log(`- Reasons: ${JSON.stringify(normalRisk.reasons)}`);
  
  if (normalRisk.score <= 35 && normalRisk.action === 'allow') {
    console.log(`${GREEN}✔ PASS: Normal user successfully ALLOWED.${RESET}\n`);
  } else {
    console.log(`${RED}✘ FAIL: Normal user should have been ALLOWED (score <= 35).${RESET}\n`);
  }


  // --- TEST 2: Suspicious Request returns THROTTLE/CHALLENGE ---
  console.log(`${BOLD}[TEST 2] Verifying Suspicious Request (Rapid + Bulk Access)...${RESET}`);
  const suspSessionId = `test_susp_${nanoid(6)}`;
  const suspHeaders = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  };

  createOrGetSession(suspSessionId, suspHeaders['user-agent'], '198.51.100.10', 'generic-fp');

  // Simulate rapid API queries
  for (let i = 0; i < 10; i++) {
    insertRequestEvent(suspSessionId, '/api/compensation/search?q=meta', 'GET', '');
  }

  // Simulate low behavior entropy (zero telemetry)
  const suspRisk = evaluateSessionRisk(suspSessionId, suspHeaders, '/api/compensation/search', 'GET');
  console.log(`- Risk Score: ${suspRisk.score}`);
  console.log(`- Defense Action: ${suspRisk.action}`);
  console.log(`- Reasons: ${JSON.stringify(suspRisk.reasons)}`);

  if (suspRisk.score > 35 && (suspRisk.action === 'throttle' || suspRisk.action === 'proof_of_work' || suspRisk.action === 'honey_maze')) {
    console.log(`${GREEN}✔ PASS: Suspicious request successfully THROTTLED/CHALLENGED.${RESET}\n`);
  } else {
    console.log(`${RED}✘ FAIL: Suspicious request should be throttled or challenged (score > 35).${RESET}\n`);
  }


  // --- TEST 3: Fake Googlebot is REJECTED/CHALLENGED ---
  console.log(`${BOLD}[TEST 3] Verifying Fake Googlebot Impersonator...${RESET}`);
  const fakeBotSessionId = `test_fakebot_${nanoid(6)}`;
  const fakeBotHeaders = {
    'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  };

  createOrGetSession(fakeBotSessionId, fakeBotHeaders['user-agent'], '198.51.100.11', 'no-fingerprint');
  insertRequestEvent(fakeBotSessionId, '/company/google', 'GET', '');

  // No good-bot signature headers sent!
  const fakeBotRisk = evaluateSessionRisk(fakeBotSessionId, fakeBotHeaders, '/company/google', 'GET');
  console.log(`- Risk Score: ${fakeBotRisk.score}`);
  console.log(`- Defense Action: ${fakeBotRisk.action}`);
  console.log(`- Reasons: ${JSON.stringify(fakeBotRisk.reasons)}`);

  if (fakeBotRisk.reasons.includes('suspicious_user_agent') && !fakeBotRisk.reasons.includes('verified_good_bot') && fakeBotRisk.score > 35) {
    console.log(`${GREEN}✔ PASS: Fake Googlebot correctly identified and CHALLENGED.${RESET}\n`);
  } else {
    console.log(`${RED}✘ FAIL: Fake Googlebot should have been challenged as a suspicious user-agent without verified lanes.${RESET}\n`);
  }


  // --- TEST 4: Signed Good Bot is ALLOWED ---
  console.log(`${BOLD}[TEST 4] Verifying Signed Good Bot (HMAC Verified)...${RESET}`);
  const goodBotSessionId = `test_goodbot_${nanoid(6)}`;
  const goodBotHeaders = {
    'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'x-shield-bot-id': 'googlebot-verified',
    'x-shield-timestamp': Math.floor(Date.now() / 1000).toString(),
    'x-shield-nonce': `nonce_${nanoid(8)}`
  } as Record<string, string>;

  // Generate valid HMAC signature
  const signature = generateGoodBotSignature(
    'GET',
    '/company/google',
    goodBotHeaders['x-shield-timestamp'],
    goodBotHeaders['x-shield-nonce'],
    ''
  );
  goodBotHeaders['x-shield-signature'] = signature;

  // Run signature verify hook
  const signatureCheck = verifyGoodBotSignature(goodBotHeaders, 'GET', '/company/google', '');
  
  createOrGetSession(goodBotSessionId, goodBotHeaders['user-agent'], '66.249.66.2', 'no-fingerprint');
  if (signatureCheck.isValid) {
    setSessionGoodBot(goodBotSessionId);
  }

  insertRequestEvent(goodBotSessionId, '/company/google', 'GET', '');

  const goodBotRisk = evaluateSessionRisk(goodBotSessionId, goodBotHeaders, '/company/google', 'GET');
  console.log(`- Signature Check: ${signatureCheck.isValid ? 'VALID' : 'INVALID'}`);
  console.log(`- Risk Score: ${goodBotRisk.score}`);
  console.log(`- Defense Action: ${goodBotRisk.action}`);
  console.log(`- Reasons: ${JSON.stringify(goodBotRisk.reasons)}`);

  if (signatureCheck.isValid && goodBotRisk.reasons.includes('verified_good_bot') && goodBotRisk.score <= 35) {
    console.log(`${GREEN}✔ PASS: Signed Good Bot successfully VERIFIED and ALLOWED.${RESET}\n`);
  } else {
    console.log(`${RED}✘ FAIL: Signed Good Bot verification or ALLOW rule failed.${RESET}\n`);
  }

  console.log(`${BOLD}====================================================`);
  console.log(`          VERIFICATION RUN COMPLETE`);
  console.log(`====================================================${RESET}`);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
