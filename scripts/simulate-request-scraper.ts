const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000';
  
  console.log(`\n====================================================`);
  console.log(`   SHIELD SIMULATOR: REQUEST SCRAPER (NO TELEMETRY)`);
  console.log(`   Targeting: ${targetUrl}`);
  console.log(`====================================================\n`);

  // We make 10 rapid search queries in a row to simulate a fast API crawler
  let cookieHeader: string | undefined = undefined;

  for (let i = 1; i <= 10; i++) {
    console.log(`[Request #${i}] Scraping search API rapidly...`);
    const start = Date.now();
    
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'python-requests/2.31.0',
        'Accept': 'application/json',
      };
      if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
      }

      const res = await fetch(`${targetUrl}/api/compensation/search?q=scraper_query_${i}`, {
        method: 'GET',
        headers
      });

      const duration = Date.now() - start;
      console.log(`  -> Status: ${res.status} (${res.statusText})`);
      console.log(`  -> Duration: ${duration}ms`);

      // Catch session cookie
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        cookieHeader = setCookie.split(';')[0];
        console.log(`  -> Session Cookie established: ${cookieHeader}`);
      }

      const body: any = await res.json().catch(() => ({}));
      if (body.challengeRequired) {
        console.log(`  💥 [MITIGATION TRIGGERED]: proof_of_work challenge requested!`);
        console.log(`  💥 Shield Score: ${body.score}`);
        break;
      }
      
      if (body.error) {
        console.log(`  💥 [ACCESS BLOCKED]: ${body.error}`);
        console.log(`  💥 Shield Score: ${body.score}`);
        break;
      }

    } catch (err: any) {
      console.error(`  -> Request failed: ${err.message}`);
    }

    await delay(100); // 100ms rapid rate
  }

  console.log(`\n====================================================`);
  console.log(`   REQUEST SCRAPER SIMULATION COMPLETE`);
  console.log(`====================================================\n`);
}

main().catch(err => {
  console.error('Simulator crashed:', err);
  process.exit(1);
});
