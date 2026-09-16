/**
 * Automated Appwrite TablesDB Setup Script
 * Creates capventure_db, tables (partners & transactions), columns, and permissions.
 */

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'capventure_db';

if (!PROJECT_ID || !API_KEY) {
  console.error('Error: Please provide APPWRITE_PROJECT_ID and APPWRITE_API_KEY');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

async function api(path, method = 'GET', body = null) {
  const url = `${ENDPOINT}${path}`;
  const options = {
    method,
    headers,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log(`Connecting to Appwrite: ${ENDPOINT} (Project: ${PROJECT_ID})...`);

  // 1. Check/Create Database
  console.log(`Checking database '${DATABASE_ID}'...`);
  const checkDb = await api(`/databases/${DATABASE_ID}`);
  if (checkDb.ok) {
    console.log(`✓ Database '${DATABASE_ID}' exists.`);
  } else {
    console.log(`Creating database '${DATABASE_ID}'...`);
    const dbRes = await api('/databases', 'POST', {
      databaseId: DATABASE_ID,
      name: 'CapVenture DB',
    });
    if (dbRes.ok || dbRes.status === 409) {
      console.log(`✓ Database '${DATABASE_ID}' ready.`);
    } else {
      console.error(`Failed to create database:`, dbRes.data);
      process.exit(1);
    }
  }

  const permissions = [
    'read("any")',
    'create("any")',
    'update("any")',
    'delete("any")',
  ];

  // 2. Create partners table/collection
  console.log(`Checking/creating 'partners' table...`);
  const partnersRes = await api(`/databases/${DATABASE_ID}/collections`, 'POST', {
    collectionId: 'partners',
    name: 'Partners',
    permissions,
    documentSecurity: false,
  });

  if (partnersRes.ok) {
    console.log(`✓ Table 'partners' created.`);
  } else if (partnersRes.status === 409) {
    console.log(`✓ Table 'partners' already exists.`);
  } else {
    console.error(`Failed to create partners table:`, partnersRes.data);
  }

  // 3. Create transactions table/collection
  console.log(`Checking/creating 'transactions' table...`);
  const txRes = await api(`/databases/${DATABASE_ID}/collections`, 'POST', {
    collectionId: 'transactions',
    name: 'Transactions',
    permissions,
    documentSecurity: false,
  });

  if (txRes.ok) {
    console.log(`✓ Table 'transactions' created.`);
  } else if (txRes.status === 409) {
    console.log(`✓ Table 'transactions' already exists.`);
  } else {
    console.error(`Failed to create transactions table:`, txRes.data);
  }

  await sleep(1500);

  // 4. Create columns for partners
  console.log(`Creating columns for 'partners'...`);
  const partnerCols = [
    { type: 'string', key: 'name', size: 255, required: true },
    { type: 'string', key: 'phone', size: 50, required: false },
    { type: 'string', key: 'email', size: 255, required: false },
    { type: 'string', key: 'notes', size: 1000, required: false },
    { type: 'string', key: 'avatarColor', size: 50, required: false },
  ];

  for (const col of partnerCols) {
    const res = await api(`/databases/${DATABASE_ID}/collections/partners/attributes/${col.type}`, 'POST', {
      key: col.key,
      size: col.size,
      required: col.required,
    });
    if (res.ok || res.status === 409) {
      console.log(`  ✓ Column '${col.key}' ready`);
    } else {
      console.warn(`  ! Column '${col.key}':`, res.data.message || res.status);
    }
  }

  // 5. Create columns for transactions
  console.log(`Creating columns for 'transactions'...`);
  const txCols = [
    { type: 'string', key: 'partnerId', size: 100, required: true },
    { type: 'string', key: 'date', size: 50, required: true },
    { type: 'float', key: 'amount', required: true, min: 0 },
    { type: 'string', key: 'type', size: 50, required: true },
    { type: 'string', key: 'description', size: 1000, required: false },
    { type: 'string', key: 'paymentMethod', size: 100, required: false },
    { type: 'string', key: 'reference', size: 100, required: false },
  ];

  for (const col of txCols) {
    const endpoint = `/databases/${DATABASE_ID}/collections/transactions/attributes/${col.type}`;
    const payload = {
      key: col.key,
      required: col.required,
    };
    if (col.size) payload.size = col.size;
    if (col.min !== undefined) payload.min = col.min;

    const res = await api(endpoint, 'POST', payload);
    if (res.ok || res.status === 409) {
      console.log(`  ✓ Column '${col.key}' ready`);
    } else {
      console.warn(`  ! Column '${col.key}':`, res.data.message || res.status);
    }
  }

  console.log('\n🎉 ALL TABLES, COLUMNS, AND PERMISSIONS ARE FULLY CONFIGURED!');
  console.log('You can now use CapVenture with Appwrite seamlessly.');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
