import { chromium } from 'playwright';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000';

  console.log(`\n====================================================`);
  console.log(`   SHIELD SIMULATOR: PLAYWRIGHT HEADLESS BOT`);
  console.log(`   Targeting: ${targetUrl}`);
  console.log(`====================================================\n`);

  console.log('[Playwright] Launching headless browser...');
  const browser = await chromium.launch({ headless: true });
  
  // Create context with default headless 800x600 screen size (suspicious footprint)
  const context = await browser.newContext({
    viewport: { width: 800, height: 600 },
    locale: 'en-US',
    timezoneId: 'UTC'
  });
  
  const page = await context.newPage();

  console.log('-> Navigating to Home...');
  await page.goto(targetUrl);
  await delay(1000);

  // robotic mouse move: perfectly linear
  console.log('-> Performing perfectly linear robotic mouse movement...');
  await page.mouse.move(10, 10);
  await page.mouse.move(200, 200);
  await page.mouse.move(400, 400);

  // instant robotic scroll
  console.log('-> Performing instant scroll jump...');
  await page.mouse.wheel(0, 600);
  await delay(500);

  console.log('-> Navigating to Search...');
  // Force click on search page link
  const searchLink = page.locator('text=Compensation, a[href*="/compensation"]');
  if (await searchLink.first().isVisible()) {
    await searchLink.first().click();
    await delay(1000);
  } else {
    await page.goto(`${targetUrl}/compensation`);
    await delay(1000);
  }

  // perfectly uniform delay typing cadence (setInterval style)
  const searchInput = page.locator('input[placeholder*="Search"], input[type="text"], input');
  if (await searchInput.isVisible()) {
    console.log('-> Typing search query with perfectly uniform 100ms key intervals...');
    await searchInput.focus();
    await page.type('input', 'Google', { delay: 100 });
    await page.keyboard.press('Enter');
    await delay(2000);
  }

  console.log('[Playwright] Closing browser...');
  await browser.close();

  console.log(`\n====================================================`);
  console.log(`   PLAYWRIGHT BOT SIMULATION COMPLETE`);
  console.log(`====================================================\n`);
}

main().catch(err => {
  console.error('Playwright simulation script crashed:', err);
  process.exit(1);
});
