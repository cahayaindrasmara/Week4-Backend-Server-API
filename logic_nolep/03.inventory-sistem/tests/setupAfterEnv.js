import { prisma } from '../lib/prisma.js';

afterAll(async () => {
  await prisma.$disconnect();
});
