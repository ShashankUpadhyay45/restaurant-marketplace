import mongoose from 'mongoose';

let memoryServerInstance: any = null;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gourmetfleet';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Successfully connected to live MongoDB at ${uri}`);
  } catch (error) {
    console.warn('\n======================================================================');
    console.warn(`[Database] Notice: Live MongoDB not detected at ${uri}.`);
    console.warn('           Launching Embedded In-Memory MongoDB Server automatically...');
    console.warn('======================================================================\n');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memUri = memoryServerInstance.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] ✅ Connected to Embedded In-Memory MongoDB at ${memUri}`);

      // Auto-populate seed data so the frontend has rich data immediately!
      const { runSeed } = await import('../seed/seed.js');
      await runSeed(false); // keep connection open
    } catch (memErr) {
      console.error('[Database Error] Could not start embedded MongoDB:', memErr);
    }
  }
}
