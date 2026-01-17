/**
 * Example of using Persephone with standard validation schemas (Zod)
 * 
 * To run this example, install zod:
 * pnpm add zod
 */

// import { z } from 'zod';
// import { Persephone } from '../index';

// // Define validation schema using Zod
// const FriendSchema = z.object({
//   name: z.string(),
//   age: z.number().min(0).max(150),
// });

// const FriendsArraySchema = z.array(FriendSchema);

// // Create database
// const db = new Persephone('FriendDatabase');

// // Use standard schema in configuration
// db.version(1).schema({
//   friends: {
//     version: 1,
//     default: [],
//     // Pass Zod schema directly - it implements StandardValidator interface
//     validator: FriendsArraySchema,
//   },
//   settings: {
//     version: 1,
//     default: { theme: 'light' },
//     validator: z.object({
//       theme: z.enum(['light', 'dark']),
//     }),
//   },
// });

// db.useMemory();
// await db.open();

// // Usage
// try {
//   // Validation will happen automatically on set()
//   await db.set('friends', [
//     { name: 'Alice', age: 21 },
//     { name: 'Bob', age: 25 },
//   ]);

//   // Data will also be validated on get()
//   const friends = await db.get('friends');
//   console.log('Friends:', friends);

//   // Invalid data will throw ValidationError
//   // await db.set('friends', [{ name: 'Invalid', age: -5 }]); // ❌ ValidationError
// } catch (e) {
//   console.error('Error:', e);
// }

export {}; // Commented out to avoid requiring zod
