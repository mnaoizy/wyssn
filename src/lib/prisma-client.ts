import { PrismaClient } from '@prisma/client';

// This approach is recommended by Prisma for Next.js applications
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

declare global {
    // allow global `var` declarations
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

// Hard-reset the client instance to fix prepared statement issues
export const db =
    global.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

// If we're not in production, attach the client instance to the global object
// This prevents multiple instances during hot-reloading
if (process.env.NODE_ENV !== 'production') {
    global.prisma = db;
}
