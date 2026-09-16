import { Client, Databases } from 'appwrite';

const client = new Client();
client.setEndpoint('https://sgp.cloud.appwrite.io/v1');
client.setProject('6aaa42010035bb510e38');
const db = new Databases(client);

const DB_ID = '6aaa45b70030ed2bdc7c';

const demoPartners = [
  {
    id: 'partner-1',
    name: 'Rahim Chowdhury (Logistics & Fleet)',
    phone: '+1 555-019-2834',
    email: 'rahim@ventures.com',
    notes: 'Freight & transport fleet investment with 15% quarterly revenue sharing.',
    avatarColor: '#10b981',
  },
  {
    id: 'partner-2',
    name: 'Karim Textiles (Import-Export)',
    phone: '+1 555-014-9921',
    email: 'karim@textiles.biz',
    notes: 'Seasonal fabric inventory financing. Fast cycle returns.',
    avatarColor: '#6366f1',
  },
];

const demoTransactions = [
  {
    id: 'tx-1',
    partnerId: 'partner-1',
    date: '2025-10-05',
    amount: 10000,
    type: 'INVESTMENT_OUT',
    description: 'Initial seed capital for purchasing 2 light commercial delivery vans',
    paymentMethod: 'Bank Wire',
    reference: 'TXN-00109',
  },
  {
    id: 'tx-2',
    partnerId: 'partner-1',
    date: '2025-11-10',
    amount: 1200,
    type: 'PROFIT_PAYOUT',
    description: 'Month 1 logistics routing operational profit share',
    paymentMethod: 'Online Transfer',
    reference: 'PAY-1102',
  },
  {
    id: 'tx-3',
    partnerId: 'partner-1',
    date: '2025-12-15',
    amount: 1500,
    type: 'PROFIT_PAYOUT',
    description: 'Month 2 logistics peak season profit payout',
    paymentMethod: 'Online Transfer',
    reference: 'PAY-1215',
  },
  {
    id: 'tx-4',
    partnerId: 'partner-1',
    date: '2026-01-10',
    amount: 2500,
    type: 'PRINCIPAL_RETURN',
    description: 'Partial capital return from client retainer settlement',
    paymentMethod: 'Bank Wire',
    reference: 'RET-0110',
  },
  {
    id: 'tx-5',
    partnerId: 'partner-1',
    date: '2026-01-20',
    amount: 5000,
    type: 'INVESTMENT_OUT',
    description: 'Supplemental capital for new regional courier contract expansion',
    paymentMethod: 'Bank Wire',
    reference: 'TXN-00244',
  },
  {
    id: 'tx-6',
    partnerId: 'partner-2',
    date: '2026-02-01',
    amount: 8000,
    type: 'INVESTMENT_OUT',
    description: 'Spring fabric container shipment pre-financing',
    paymentMethod: 'Check deposit',
    reference: 'CHK-8891',
  },
  {
    id: 'tx-7',
    partnerId: 'partner-2',
    date: '2026-02-28',
    amount: 1400,
    type: 'PROFIT_PAYOUT',
    description: 'First shipment batch turnover net margin profit payout',
    paymentMethod: 'Online Transfer',
    reference: 'PAY-0228',
  },
  {
    id: 'tx-8',
    partnerId: 'partner-1',
    date: '2026-03-05',
    amount: 1850,
    type: 'PROFIT_PAYOUT',
    description: 'Fleet logistics Q1 monthly distribution',
    paymentMethod: 'Bank Wire',
    reference: 'PAY-0305',
  },
  {
    id: 'tx-9',
    partnerId: 'partner-2',
    date: '2026-03-12',
    amount: 3000,
    type: 'PRINCIPAL_RETURN',
    description: 'Wholesale clearance proceeds capital payback',
    paymentMethod: 'Online Transfer',
    reference: 'RET-0312',
  },
];

async function seed() {
  console.log('Seeding partners...');
  for (const p of demoPartners) {
    try {
      await db.createDocument(DB_ID, 'partners', p.id, {
        name: p.name,
        phone: p.phone,
        email: p.email,
        notes: p.notes,
        avatarColor: p.avatarColor,
      });
      console.log('  ✓ Created partner:', p.name);
    } catch (e) {
      console.log('  Partner exists or skipped:', p.id);
    }
  }

  console.log('Seeding transactions...');
  for (const t of demoTransactions) {
    try {
      await db.createDocument(DB_ID, 'transactions', t.id, {
        partnerId: t.partnerId,
        date: t.date,
        amount: t.amount,
        type: t.type,
        description: t.description,
        paymentMethod: t.paymentMethod,
        reference: t.reference,
      });
      console.log('  ✓ Created transaction:', t.id);
    } catch (e) {
      console.log('  Tx exists or skipped:', t.id);
    }
  }

  console.log('Seeding finished!');
}

seed().catch(console.error);
