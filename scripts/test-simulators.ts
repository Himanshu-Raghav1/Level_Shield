import { POST } from '../src/app/api/simulate/[profile]/route';
import { NextRequest } from 'next/server';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

async function testProfile(profile: string) {
  console.log(`Testing simulator API route for profile: ${BOLD}${profile}${RESET}...`);
  
  const req = new NextRequest(`http://localhost:3000/api/simulate/${profile}`, {
    method: 'POST',
  });
  
  try {
    // Call the dynamic POST route handler directly
    const response = await POST(req, { params: Promise.resolve({ profile }) });
    const data: any = await response.json();
    
    if (response.status === 200 && data.success) {
      console.log(`  ${GREEN}✔ PASS: Generated Session: ${data.sessionId}${RESET}`);
      return true;
    } else {
      console.log(`  ${RED}✘ FAIL: Status: ${response.status}, Error: ${data.error || 'Unknown'}${RESET}`);
      return false;
    }
  } catch (err: any) {
    console.log(`  ${RED}✘ CRITICAL ERROR: ${err.message}${RESET}`);
    return false;
  }
}

async function run() {
  console.log(`${BOLD}====================================================`);
  console.log(`        LEVEL SHIELD SIMULATOR API VERIFIER`);
  console.log(`====================================================${RESET}\n`);

  const profiles = [
    'normal-user',
    'power-user',
    'request-scraper',
    'sequential-scraper',
    'playwright-bot',
    'ai-agent',
    'fake-googlebot',
    'good-bot'
  ];

  let allPassed = true;
  for (const p of profiles) {
    const passed = await testProfile(p);
    if (!passed) allPassed = false;
    console.log('');
  }

  console.log(`${BOLD}====================================================`);
  if (allPassed) {
    console.log(`  ${GREEN}${BOLD}ALL SIMULATOR API ROUTES PASSED SUCCESSFULLY!${RESET}`);
  } else {
    console.log(`  ${RED}${BOLD}SOME SIMULATOR API ROUTES FAILED!${RESET}`);
    process.exit(1);
  }
  console.log(`${BOLD}====================================================${RESET}`);
}

run().catch(err => {
  console.error('Verifier script crashed:', err);
  process.exit(1);
});
