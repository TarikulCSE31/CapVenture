const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '6aaa42010035bb510e38';
const API_KEY = process.env.APPWRITE_API_KEY || 'standard_6db826c76e07adb07c06737b145b8d2f28cd71acb0d34b296b6b5c606c5cb7f0152bb957b6bc25d2996056dc2b871ab930fe8867048cf414cfdbaeb02d02a17091a2fea1014a030ec47348daf26889678e2242cb6a818e86f4ca038fc50294d8040c4670db96fa52c842792d33968a0b0197ac4a0cacd182a333411dfcc30dde';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '6aaa45b70030ed2bdc7c';

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

async function api(path, method = 'GET', body = null) {
  const url = `${ENDPOINT}${path}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log(`Connecting to TablesDB at ${ENDPOINT} (DB: ${DATABASE_ID})...`);

  const permissions = [
    'read("any")',
    'create("any")',
    'update("any")',
    'delete("any")',
  ];

  // 1. Create/Update 'partners' table
  console.log(`Setting up 'partners' table...`);
  let partnersRes = await api(`/tablesdb/${DATABASE_ID}/tables`, 'POST', {
    tableId: 'partners',
    name: 'Partners',
    permissions,
  });

  if (partnersRes.ok) {
    console.log(`✓ 'partners' table created.`);
  } else if (partnersRes.status === 409) {
    console.log(`✓ 'partners' table already exists. Updating permissions...`);
    await api(`/tablesdb/${DATABASE_ID}/tables/partners`, 'PUT', {
      name: 'Partners',
      permissions,
    });
  } else {
    console.error(`Error creating partners table:`, partnersRes.data);
  }

  // 2. Create/Update 'transactions' table
  console.log(`Setting up 'transactions' table...`);
  let txRes = await api(`/tablesdb/${DATABASE_ID}/tables`, 'POST', {
    tableId: 'transactions',
    name: 'Transactions',
    permissions,
  });

  if (txRes.ok) {
    console.log(`✓ 'transactions' table created.`);
  } else if (txRes.status === 409) {
    console.log(`✓ 'transactions' table already exists. Updating permissions...`);
    await api(`/tablesdb/${DATABASE_ID}/tables/transactions`, 'PUT', {
      name: 'Transactions',
      permissions,
    });
  } else {
    console.error(`Error creating transactions table:`, txRes.data);
  }

  await sleep(1000);

  // 3. Add columns to 'partners'
  console.log(`Creating columns for 'partners'...`);
  const partnerCols = [
    { type: 'string', key: 'name', size: 255, required: true },
    { type: 'string', key: 'phone', size: 50, required: false },
    { type: 'string', key: 'email', size: 255, required: false },
    { type: 'string', key: 'notes', size: 1000, required: false },
    { type: 'string', key: 'avatarColor', size: 50, required: false },
  ];

  for (const col of partnerCols) {
    const res = await api(`/tablesdb/${DATABASE_ID}/tables/partners/columns/${col.type}`, 'POST', {
      key: col.key,
      size: col.size,
      required: col.required,
    });
    if (res.ok || res.status === 409) {
      console.log(`  ✓ Column '${col.key}' created / ready`);
    } else {
      console.warn(`  ! Column '${col.key}':`, res.data?.message || res.status);
    }
  }

  // 4. Add columns to 'transactions'
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
    const payload = {
      key: col.key,
      required: col.required,
    };
    if (col.size) payload.size = col.size;
    if (col.min !== undefined) payload.min = col.min;

    const res = await api(`/tablesdb/${DATABASE_ID}/tables/transactions/columns/${col.type}`, 'POST', payload);
    if (res.ok || res.status === 409) {
      console.log(`  ✓ Column '${col.key}' created / ready`);
    } else {
      console.warn(`  ! Column '${col.key}':`, res.data?.message || res.status);
    }
  }

  console.log('\n🎉 SUCCESS! All tables, columns, and permissions are created in Appwrite TablesDB!');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
