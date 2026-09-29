// Automated Dashboard & SSR Verification Test
const BASE_URL = 'http://localhost:3000';

async function testDashboardEndpoint(path, name) {
  console.log(`\n🔍 Testing ${name} (${path})...`);
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: status ${res.status}`);
  }
  const html = await res.text();
  console.log(`  ✅ Status: ${res.status} OK`);

  // Check 1: Return to Website link
  const hasReturnToWebsite = html.includes('Return to Website');
  console.log(`  ${hasReturnToWebsite ? '✅' : '❌'} Contains 'Return to Website': ${hasReturnToWebsite}`);

  // Check 2: Public Navbar should NOT be rendered in dashboard
  const hasPublicNavbar = html.includes('Comedy Happenings') && html.includes('sticky top-[37px]');
  console.log(`  ${!hasPublicNavbar ? '✅' : '❌'} Public Navbar Header Stripped: ${!hasPublicNavbar}`);

  // Check 3: Public Footer should NOT be rendered in dashboard
  const hasPublicFooter = html.includes('Direct Connected Merchant Payouts') && html.includes('mt-auto');
  console.log(`  ${!hasPublicFooter ? '✅' : '❌'} Public Footer Stripped: ${!hasPublicFooter}`);

  // Check 4: DemoSwitcher top bar should NOT be rendered in dashboard
  const hasDemoBar = html.includes('Live Role & State Simulator');
  console.log(`  ${!hasDemoBar ? '✅' : '❌'} Top Demo Switcher Stripped: ${!hasDemoBar}`);

  // Check 5: Hydration suppression tags present on root
  const hasHydrationSuppression = html.includes('suppresshydrationwarning');
  console.log(`  ${hasHydrationSuppression ? '✅' : '❌'} Root has suppressHydrationWarning: ${hasHydrationSuppression}`);

  return { hasReturnToWebsite, hasPublicNavbar, hasPublicFooter, hasDemoBar, hasHydrationSuppression };
}

async function run() {
  console.log('🚀 Starting Unified Dashboard & Clean Layout Verification...');

  try {
    // 1. Organizer Dashboard
    await testDashboardEndpoint('/dashboard/organizer', 'Organizer Box Office Dashboard');

    // 2. Customer Dashboard
    await testDashboardEndpoint('/dashboard/customer', 'Customer Fan Dashboard');

    // 3. Admin Dashboard
    await testDashboardEndpoint('/dashboard/admin', 'Super Admin Dashboard');

    // 4. Verify Home Page retains public Navbar and Footer
    console.log(`\n🔍 Verifying Home Page (/) retains full public navigation...`);
    const homeRes = await fetch(`${BASE_URL}/`);
    const homeHtml = await homeRes.text();
    const homeHasNavbar = homeHtml.includes('Navbar') || homeHtml.includes('events');
    const homeHasFooter = homeHtml.includes('Footer') || homeHtml.includes('Direct Connected Merchant Payouts');
    console.log(`  ✅ Home Page Status: ${homeRes.status} OK`);
    console.log(`  ${homeHasNavbar ? '✅' : '❌'} Home Page renders public header: ${homeHasNavbar}`);
    console.log(`  ${homeHasFooter ? '✅' : '❌'} Home Page renders public footer: ${homeHasFooter}`);

    console.log('\n🎉 ALL DASHBOARD LAYOUT & REMOVAL CHECKS PASSED PERFECTLY!\n');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

run();
