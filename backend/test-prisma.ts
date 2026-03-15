
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function test() {
  console.log('--- Prisma Diagnostic ---');
  console.log('DATABASE_URL from process.env:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
  
  try {
    console.log('Attempting to instantiate PrismaClient...');
    const prisma = new PrismaClient();
    console.log('Successfully instantiated PrismaClient!');
    
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('Successfully connected to database!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('CRITICAL ERROR:', error);
    if (error instanceof Error) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    }
  }
}

test();
