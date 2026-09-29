import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function testAuthSecurityAndTicketing() {
  console.log('🧪 Starting Ticketing Marketplace & Auth Gate Validation...\n');

  // Test 1: Verify Payout Settings Endpoint strictly blocks unauthenticated requests
  console.log('1. Testing Payout Settings Endpoint Security (No auth token/actor)...');
  const unauthRes = await fetch(`${BASE_URL}/api/account/payout-settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organizerId: '10000000-0000-0000-0000-000000000002',
      stripeAccountId: 'acct_hacked_123',
    }),
  });
  const unauthData = await unauthRes.json();
  assert.strictEqual(unauthRes.status, 401, 'Unauthenticated payment edit must return 401');
  assert.strictEqual(unauthData.error, 'Unauthorized', 'Error must be Unauthorized');
  console.log('   ✅ PASS: Unauthenticated user was strictly blocked from editing payment settings (401).\n');

  // Test 2: Verify Homepage loads ComedySeat brand assets and categories
  console.log('2. Testing Homepage for ComedySeat branding and categories...');
  const homeRes = await fetch(`${BASE_URL}`);
  const homeHtml = await homeRes.text();
  assert.ok(homeHtml.includes('Pull Up A Seat To Comedy'), 'Homepage must contain ComedySeat tagline');
  assert.ok(homeHtml.includes('Stand up Comedy') || homeHtml.includes('Stand-Up'), 'Homepage must contain comedy categories');
  assert.ok(homeHtml.includes('comedyseat-logo.png'), 'Homepage must link to official ComedySeat logo');
  console.log('   ✅ PASS: ComedySeat branding and comedy categories verified on homepage.\n');

  // Test 3: Verify Login and Register pages load properly
  console.log('3. Testing /auth/login and /auth/register endpoints...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`);
  assert.strictEqual(loginRes.status, 200, '/auth/login must return 200 OK');
  const registerRes = await fetch(`${BASE_URL}/auth/register`);
  assert.strictEqual(registerRes.status, 200, '/auth/register must return 200 OK');
  console.log('   ✅ PASS: /auth/login and /auth/register are active and operational.\n');

  // Test 4: Verify Direct Payment Ticket Booking (Sonny\'s LouddMouth Comedy Brand)
  console.log('4. Testing Ticket Purchase & Direct Merchant Routing for Sonny\'s LouddMouth...');
  const buyRes = await fetch(`${BASE_URL}/api/checkout/sandbox-complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: '00000000-0000-0000-0000-000000000005',
      customerName: 'Alex Morgan',
      customerEmail: 'alex@comedyseat.com',
      eventId: '20000000-0000-0000-0000-000000000001', // Sonny's LouddMouth Live
      ticketTypeId: '30000000-0000-0000-0000-000000000001',
      quantity: 2,
      idempotencyKey: `idem_test_cmdy_${Date.now()}`,
    }),
  });
  const buyData = await buyRes.json();
  assert.strictEqual(buyRes.status, 200, 'Checkout must succeed');
  assert.strictEqual(buyData.order.payment_gateway_account_id, 'acct_org_louddmouth_001', 'Direct payment must route to Sonny\'s LouddMouth account');
  assert.strictEqual(buyData.tickets.length, 2, '2 tickets must be issued');
  console.log(`   ✅ PASS: Direct payment of $${buyData.order.total_amount} routed to ${buyData.order.payment_gateway_account_id}.\n`);

  // Test 5: Verify Ticket Check-In Scanner validates newly issued comedy ticket
  console.log('5. Testing Box Office Ticket Scanner...');
  const ticketCode = buyData.tickets[0].ticket_code;
  const scanRes = await fetch(`${BASE_URL}/api/tickets/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticketCode,
      scannedByUserId: '00000000-0000-0000-0000-000000000002', // Sonny
    }),
  });
  const scanData = await scanRes.json();
  assert.strictEqual(scanData.status, 'checked_in', 'Ticket should be checked_in on first scan');
  console.log(`   ✅ PASS: Ticket ${ticketCode} verified and marked as checked_in at door.\n`);

  // Test 6: Verify Frictionless Guest Buying with Automatic Account Creation
  console.log('6. Testing Guest Checkout with Automatic Account Creation...');
  const newGuestEmail = `guestfan_${Date.now()}@example.com`;
  const newGuestName = 'Sarah Comedy Fan';
  const guestBuyRes = await fetch(`${BASE_URL}/api/checkout/sandbox-complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: newGuestName,
      customerEmail: newGuestEmail,
      eventId: '20000000-0000-0000-0000-000000000002', // The Stand NYC Improv
      ticketTypeId: '30000000-0000-0000-0000-000000000003',
      quantity: 1,
      idempotencyKey: `idem_guest_${Date.now()}`,
    }),
  });
  const guestBuyData = await guestBuyRes.json();
  assert.strictEqual(guestBuyRes.status, 200, 'Guest checkout must succeed without prior account');
  assert.strictEqual(guestBuyData.autoCreatedAccount, true, 'autoCreatedAccount must be true for guest');
  assert.ok(guestBuyData.user, 'User object must be returned');
  assert.strictEqual(guestBuyData.user.email, newGuestEmail, 'New user email must match guest email');
  assert.strictEqual(guestBuyData.user.full_name, newGuestName, 'New user name must match guest name');
  assert.strictEqual(guestBuyData.order.customer_id, guestBuyData.user.id, 'Order must be attached to the new auto-created account');
  console.log(`   ✅ PASS: Guest bought ticket without prior account. Account automatically created for ${newGuestEmail} (User ID: ${guestBuyData.user.id}).\n`);

  console.log('🎉 ALL PRODUCTION-READY TICKETING & AUTH SECURITY TESTS PASSED SUCCESSFULLY!\n');
}

testAuthSecurityAndTicketing().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
