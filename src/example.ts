/**
 * Example of using Persephone
 * 
 * Now with migrations and validation support!
 * 
 * Uncomment to run:
 */

/*
import { Persephone } from './index';

const db = new Persephone('FriendDatabase');

db.version(1).schema({
  friends: {
    version: 1,
    default: [],
  },
  settings: {
    version: 1,
    default: { theme: 'light' },
  },
});

db.useMemory();
await db.open();

try {
  await db.set('friends', [{ name: 'Alice', age: 21 }]);
  const friends = await db.get('friends');
  console.log('Friends:', friends);
} catch (e) {
  console.error('Error:', e);
}
*/
