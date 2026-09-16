import { Client, Databases } from 'appwrite';

const client = new Client();
client.setEndpoint('https://sgp.cloud.appwrite.io/v1');
client.setProject('6aaa42010035bb510e38');
const db = new Databases(client);

async function test() {
  const res = await db.createDocument('6aaa45b70030ed2bdc7c', 'partners', 'test_p1', {
    name: 'Rahim Test Partner',
    phone: '+1 555-0199',
  });
  console.log('CREATE SUCCESS. Document ID:', res.$id);
  await db.deleteDocument('6aaa45b70030ed2bdc7c', 'partners', 'test_p1');
  console.log('DELETE SUCCESS.');
}

test().catch(err => console.error('Error:', err.message));
