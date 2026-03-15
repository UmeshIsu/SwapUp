import { PrismaClient } from '.prisma/client';

// Instantiate first so TypeScript infers the full concrete type (with all model delegates)
const prismaInstance = new PrismaClient({ log: ['error'] });

const globalForPrisma = globalThis as unknown as {
    prisma: typeof prismaInstance;
};

export const prisma: typeof prismaInstance =
    globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
