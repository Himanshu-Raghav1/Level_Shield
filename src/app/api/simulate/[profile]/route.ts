import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store/db';
import { nanoid } from 'nanoid';

// List of supported profiles
const SUPPORTED_PROFILES = [
  'normal-user',
  'power-user',
  'request-scraper',
  'sequential-scraper',
  'playwright-bot',
  'ai-agent',
  'fake-googlebot',
  'good-bot'
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ profile: string }> }
) {
  try {
    const { profile } = await params;
    const cleanProfile = profile.toLowerCase().trim();

    if (!SUPPORTED_PROFILES.includes(cleanProfile)) {
      return NextResponse.json({
        success: false,
        error: `Unsupported profile. Choose from: ${SUPPORTED_PROFILES.join(', ')}`
      }, { status: 400 });
    }

    // Generate unique session ID for this simulation run
    const sessionId = `sim_${cleanProfile}_${nanoid(8)}`;
    const now = new Date();

    // Setup profile data
    let ipAddress = '127.0.0.1';
    let userAgent = 'Mozilla/5.0';
    let fingerprint = 'generic-fp';
    let isGoodBot = 0;

    if (cleanProfile === 'normal-user') {
      ipAddress = '64.233.160.21';
      userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      fingerprint = 'fp_mac_chrome_120';
    } else if (cleanProfile === 'power-user') {
      ipAddress = '72.14.201.44';
      userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
      fingerprint = 'fp_win_chrome_121';
    } else if (cleanProfile === 'request-scraper') {
      ipAddress = '198.51.100.12';
      userAgent = 'python-requests/2.31.0';
      fingerprint = 'no-fingerprint';
    } else if (cleanProfile === 'sequential-scraper') {
      ipAddress = '203.0.113.88';
      userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/119.0.0.0 Safari/537.36';
      fingerprint = 'fp_linux_headless_119';
    } else if (cleanProfile === 'playwright-bot') {
      ipAddress = '198.51.100.55';
      userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36';
      fingerprint = 'fp_mac_headless_120';
    } else if (cleanProfile === 'ai-agent') {
      ipAddress = '23.22.14.8';
      userAgent = 'GPTBot/1.0 (https://openai.com/gptbot)';
      fingerprint = 'no-fingerprint';
    } else if (cleanProfile === 'fake-googlebot') {
      ipAddress = '66.249.66.1';
      userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
      fingerprint = 'no-fingerprint';
    } else if (cleanProfile === 'good-bot') {
      ipAddress = '66.249.66.2';
      userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
      fingerprint = 'no-fingerprint';
      isGoodBot = 1;
    }

    // Begin database transaction (using atomic statements)
    // 1. Insert Session
    db.prepare(`
      INSERT INTO sessions (id, created_at, user_agent, ip_address, fingerprint, is_good_bot)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(sessionId, new Date(now.getTime() - 10 * 60 * 1000).toISOString(), userAgent, ipAddress, fingerprint, isGoodBot);

    // 2. Insert Timeline events based on profile
    const insertRequest = (path: string, method: string, referrer: string, delaySec: number) => {
      const id = `req_${nanoid(16)}`;
      const timestamp = new Date(now.getTime() - delaySec * 1000).toISOString();
      db.prepare(`
        INSERT INTO request_events (id, session_id, url, method, referrer, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, sessionId, path, method, referrer, timestamp);
    };

    const insertBehavior = (type: string, details: any, delaySec: number) => {
      const id = `beh_${nanoid(16)}`;
      const timestamp = new Date(now.getTime() - delaySec * 1000).toISOString();
      const detailsStr = JSON.stringify(details);
      db.prepare(`
        INSERT INTO behavior_events (id, session_id, event_type, details, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, sessionId, type, detailsStr, timestamp);
    };

    const insertRisk = (score: number, reasons: string[], delaySec: number) => {
      const id = `risk_${nanoid(16)}`;
      const timestamp = new Date(now.getTime() - delaySec * 1000).toISOString();
      const reasonsStr = JSON.stringify(reasons);
      db.prepare(`
        INSERT INTO risk_events (id, session_id, score, reasons, confidence, timestamp)
        VALUES (?, ?, ?, ?, 0.95, ?)
      `).run(id, sessionId, score, reasonsStr, timestamp);
    };

    const insertDefense = (action: string, resolved: number, delaySec: number) => {
      const id = `def_${nanoid(16)}`;
      const timestamp = new Date(now.getTime() - delaySec * 1000).toISOString();
      db.prepare(`
        INSERT INTO defense_actions (id, session_id, action, resolved, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, sessionId, action, resolved, timestamp);
    };

    // Populate timeline and data based on cleanProfile
    if (cleanProfile === 'normal-user') {
      // 5 minutes of realistic browsing
      insertRequest('/', 'GET', '', 300);
      insertRequest('/compensation', 'GET', 'http://google.com/search', 280);
      insertRequest('/api/compensation/search?q=google', 'GET', 'http://localhost:3000/compensation', 250);
      insertRequest('/company/google', 'GET', 'http://localhost:3000/compensation', 180);
      insertRequest('/api/companies/google', 'GET', 'http://localhost:3000/company/google', 178);
      insertRequest('/compensation', 'GET', 'http://localhost:3000/company/google', 60);

      // Human-like Telemetry (High behavior entropy)
      insertBehavior('telemetry_submission', {
        mouseMoves: [
          { x: 120, y: 150, t: 10 },
          { x: 150, y: 190, t: 40 },
          { x: 220, y: 280, t: 90 },
          { x: 310, y: 320, t: 150 }
        ],
        scrolls: [
          { y: 100, t: 50 },
          { y: 250, t: 120 },
          { y: 480, t: 200 }
        ],
        clicks: [{ x: 310, y: 320, t: 160 }],
        keycadence: [
          { key: 'g', delay: 150 },
          { key: 'o', delay: 180 },
          { key: 'o', delay: 120 },
          { key: 'g', delay: 220 }
        ],
        screenSize: { width: 1440, height: 900 },
        timezone: 'America/New_York'
      }, 120);

      insertRisk(5, [], 20);
      insertDefense('allow', 0, 20);

    } else if (cleanProfile === 'power-user') {
      // Faster, heavier human user
      insertRequest('/', 'GET', '', 600);
      insertRequest('/compensation', 'GET', '', 580);
      insertRequest('/api/compensation/search?q=google', 'GET', '', 560);
      insertRequest('/company/google', 'GET', '', 500);
      insertRequest('/api/compensation/search?q=meta', 'GET', '', 450);
      insertRequest('/company/meta', 'GET', '', 400);
      insertRequest('/api/compensation/search?q=netflix', 'GET', '', 300);
      insertRequest('/company/netflix', 'GET', '', 250);
      insertRequest('/api/compensation/search?q=stripe', 'GET', '', 120);
      insertRequest('/company/stripe', 'GET', '', 90);

      insertBehavior('telemetry_submission', {
        mouseMoves: [
          { x: 100, y: 100, t: 5 },
          { x: 190, y: 220, t: 30 },
          { x: 340, y: 410, t: 70 },
          { x: 500, y: 480, t: 110 }
        ],
        scrolls: [
          { y: 50, t: 20 },
          { y: 200, t: 60 },
          { y: 400, t: 100 },
          { y: 800, t: 150 }
        ],
        clicks: [{ x: 500, y: 480, t: 120 }],
        keycadence: [
          { key: 'm', delay: 110 },
          { key: 'e', delay: 90 },
          { key: 't', delay: 130 },
          { key: 'a', delay: 100 }
        ],
        screenSize: { width: 1920, height: 1080 },
        timezone: 'Europe/London'
      }, 100);

      insertRisk(18, [], 50);
      insertDefense('allow', 0, 50);

    } else if (cleanProfile === 'request-scraper') {
      // Rapid requests, no UI telemetry
      for (let i = 0; i < 15; i++) {
        insertRequest(`/api/compensation/search?q=comp_${i}`, 'GET', '', 30 - i * 1.5);
      }

      // No behavior events at all! Low behavior entropy score triggered

      insertRisk(68, ['rapid_requests', 'low_behavior_entropy', 'suspicious_user_agent', 'compensation_bulk_access'], 5);
      insertDefense('proof_of_work', 0, 5);

    } else if (cleanProfile === 'sequential-scraper') {
      // Linear access of companies, exact interval matching
      const companies = ['google', 'meta', 'netflix', 'apple', 'amazon', 'stripe'];
      for (let i = 0; i < companies.length; i++) {
        // Exact 3 second delay difference (perfect intervals)
        insertRequest(`/company/${companies[i]}`, 'GET', '', 60 - i * 3);
        insertRequest(`/api/companies/${companies[i]}`, 'GET', '', 60 - i * 3);
      }

      // Telemetry representing headless Chrome configuration
      insertBehavior('telemetry_submission', {
        mouseMoves: [], // No mouse movement
        scrolls: [{ y: 600, t: 10 }], // Robotic instant jump
        screenSize: { width: 800, height: 600 }, // Default headless size
        timezone: 'UTC'
      }, 30);

      // Fell into Honey Maze trap!
      const mazeToken = `maze_${nanoid(10)}`;
      db.prepare(`
        INSERT INTO canary_tokens (token, session_id, exposed)
        VALUES (?, ?, 0)
      `).run(mazeToken, sessionId);

      db.prepare(`
        INSERT INTO honey_maze_hits (id, session_id, token, timestamp)
        VALUES (?, ?, ?, ?)
      `).run(`maze_${nanoid(16)}`, sessionId, mazeToken, new Date(now.getTime() - 10 * 1000).toISOString());

      insertRisk(85, ['sequential_url_access', 'unusual_navigation', 'low_behavior_entropy', 'fingerprint_mismatch', 'honey_link_triggered'], 8);
      insertDefense('honey_maze', 0, 8);

    } else if (cleanProfile === 'playwright-bot') {
      // Linear mouse moves and uniform delay typing cadence
      insertRequest('/company/google', 'GET', '', 120);
      insertRequest('/company/meta', 'GET', '', 100);
      insertRequest('/company/netflix', 'GET', '', 80);

      // Automated Playwright Telemetry
      insertBehavior('telemetry_submission', {
        mouseMoves: [
          { x: 10, y: 10, t: 10 },
          { x: 20, y: 20, t: 20 },
          { x: 30, y: 30, t: 30 },
          { x: 40, y: 40, t: 40 } // Perfectly straight line!
        ],
        scrolls: [{ y: 500, t: 5 }],
        keycadence: [
          { key: 'n', delay: 100 },
          { key: 'e', delay: 100 },
          { key: 't', delay: 100 } // Perfectly uniform 100ms delay!
        ],
        screenSize: { width: 800, height: 600 },
        timezone: 'UTC'
      }, 90);

      insertRisk(95, ['suspicious_user_agent', 'low_behavior_entropy', 'perfectly_linear_mouse', 'perfectly_uniform_typing', 'fingerprint_mismatch'], 30);
      insertDefense('block', 0, 30);

    } else if (cleanProfile === 'ai-agent') {
      // Scraped robot beacons, has specific AI User-Agent
      insertRequest('/', 'GET', '', 80);
      insertRequest('/api/compensation/search?q=openai', 'GET', '', 70);

      // AI Agent beacon trigger
      const beaconToken = `beacon_${nanoid(8)}`;
      db.prepare(`
        INSERT INTO agent_beacons (id, session_id, token, timestamp)
        VALUES (?, ?, ?, ?)
      `).run(`beacon_${nanoid(16)}`, sessionId, beaconToken, new Date(now.getTime() - 40 * 1000).toISOString());

      insertRisk(90, ['suspicious_user_agent', 'agent_beacon_triggered', 'low_behavior_entropy'], 20);
      insertDefense('block', 0, 20);

    } else if (cleanProfile === 'fake-googlebot') {
      // Impersonated googlebot without signature
      insertRequest('/company/google', 'GET', '', 60);
      insertRequest('/company/meta', 'GET', '', 50);

      insertRisk(60, ['suspicious_user_agent', 'low_behavior_entropy'], 15);
      insertDefense('proof_of_work', 0, 15);

    } else if (cleanProfile === 'good-bot') {
      // Impersonated googlebot WITH valid signature
      insertRequest('/company/google', 'GET', '', 60);
      insertRequest('/company/meta', 'GET', '', 50);

      // Replay nonce insert for good-bot proof
      db.prepare(`
        INSERT INTO good_bot_nonces (nonce, timestamp)
        VALUES (?, ?)
      `).run(`sim_nonce_${nanoid(10)}`, new Date(now.getTime() - 60 * 1000).toISOString());

      insertRisk(0, ['verified_good_bot'], 10);
      insertDefense('allow', 0, 10);
    }

    return NextResponse.json({
      success: true,
      profile: cleanProfile,
      sessionId,
      message: `Successfully populated mock timeline and events for simulated profile: ${cleanProfile}`
    });

  } catch (error: any) {
    console.error('Error running bot simulation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
