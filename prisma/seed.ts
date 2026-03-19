import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = `${process.env.DATABASE_URL ?? ''}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Media types used across services/routes
  await prisma.mediaType.upsert({
    where: { name: 'MOVIE' },
    update: {},
    create: { name: 'MOVIE' },
  });

  await prisma.mediaType.upsert({
    where: { name: 'SERIES' },
    update: {},
    create: { name: 'SERIES' },
  });

  // Optional: if you intend to create generic media without movie/series info,
  // you can seed a "MEDIA" type and use it from the Media endpoint.
  await prisma.mediaType.upsert({
    where: { name: 'MEDIA' },
    update: {},
    create: { name: 'MEDIA' },
  });

  // Watch link types used by WatchLink
  const watchLinkTypes = ['TRAILER', 'FULL', 'CLIP'] as const;
  for (const name of watchLinkTypes) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.watchLinkType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

