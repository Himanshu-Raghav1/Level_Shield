import { chromium, Page } from 'playwright';

// Helper to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate organic mouse movement using a Bezier curve approximation
async function moveMouseOrganically(page: Page, fromX: number, fromY: number, toX: number, toY: number, steps = 15) {
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Cubic bezier interpolation
    const cx1 = fromX + (toX - fromX) * 0.25;
    const cy1 = fromY + (toY - fromY) * 0.1;
    const cx2 = fromX + (toX - fromX) * 0.75;
    const cy2 = fromY + (toY - fromY) * 0.9;

    const x = Math.round(
      Math.pow(1 - t, 3) * fromX +
      3 * Math.pow(1 - t, 2) * t * cx1 +
      3 * (1 - t) * Math.pow(t, 2) * cx2 +
      Math.pow(t, 3) * toX
    );
    const y = Math.round(
      Math.pow(1 - t, 3) * fromY +
      3 * Math.pow(1 - t, 2) * t * cy1 +
      3 * (1 - t) * Math.pow(t, 2) * cy2 +
      Math.pow(t, 3) * toY
    );

    await page.mouse.move(x, y);
    await delay(10 + Math.random() * 20); // Organic pacing
  }
}

// Simulate realistic human typing delay
async function typeOrganically(page: Page, selector: string, text: string) {
  await page.focus(selector);
  for (const char of text) {
    await page.keyboard.type(char);
    await delay(100 + Math.random() * 150); // Human cadence (100ms - 250ms per key)
  }
}

async function runNormalUser(targetUrl: string) {
  console.log(`[SIMULATOR] Launching organic 'normal-user' browser simulation against ${targetUrl}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // 1. Visit homepage
  console.log('-> Navigating to Home...');
  await page.goto(targetUrl);
  await delay(1500);

  // 2. Move mouse organically on the landing page
  await moveMouseOrganically(page, 100, 100, 450, 300);
  await delay(1000);

  // 3. Navigate to search page
  console.log('-> Navigating to Compensation search...');
  await page.click('text=Compensation');
  await delay(2000);

  // 4. Type a query organically
  const searchInput = 'input[placeholder*="Search"], input[type="text"], input';
  if (await page.locator(searchInput).isVisible()) {
    console.log('-> Typing search query organically...');
    await moveMouseOrganically(page, 450, 300, 600, 150);
    await typeOrganically(page, searchInput, 'Google');
    await page.keyboard.press('Enter');
    await delay(2000);
  }

  // 5. Scroll organically
  console.log('-> Scrolling page organically...');
  await page.mouse.wheel(0, 150);
  await delay(400);
  await page.mouse.wheel(0, 200);
  await delay(600);

  // 6. Click a company detail page
  console.log('-> Clicking company details...');
  await page.click('text=Google');
  await delay(3000);

  await browser.close();
  console.log('[SIMULATOR] Normal user simulation complete.');
}

async function runPlaywrightBot(targetUrl: string) {
  console.log(`[SIMULATOR] Launching rapid 'playwright-bot' browser simulation against ${targetUrl}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 800, height: 600 } // Suspect screen size
  });
  const page = await context.newPage();

  // 1. Straight instant jumps & uniform rapid clicks
  console.log('-> Rapid navigation to Home...');
  await page.goto(targetUrl);
  
  // Straight linear mouse movement (zero curvature/variance)
  console.log('-> Perfectly linear mouse movement...');
  await page.mouse.move(100, 100);
  await page.mouse.move(400, 400); // 1-step instant move

  // Instant scroll jump
  console.log('-> Instant scroll jump...');
  await page.mouse.wheel(0, 800);

  // Rapid uniform typing (100ms exact delay)
  console.log('-> Rapid uniform typing...');
  const searchInput = 'input[placeholder*="Search"], input[type="text"], input';
  if (await page.locator(searchInput).isVisible()) {
    await page.focus(searchInput);
    await page.type(searchInput, 'Google', { delay: 100 });
    await page.keyboard.press('Enter');
  }

  await delay(1000);
  await browser.close();
  console.log('[SIMULATOR] Playwright bot simulation complete.');
}

async function main() {
  const args = process.argv.slice(2);
  const profile = args.find(arg => arg.startsWith('--profile='))?.split('=')[1] || 'normal-user';
  const url = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000';

  if (profile === 'normal-user') {
    await runNormalUser(url);
  } else if (profile === 'playwright-bot') {
    await runPlaywrightBot(url);
  } else {
    console.log(`Profile ${profile} not implemented in Playwright. Supported: normal-user, playwright-bot`);
  }
}

main().catch(err => {
  console.error('Playwright simulation script crashed:', err);
  process.exit(1);
});
