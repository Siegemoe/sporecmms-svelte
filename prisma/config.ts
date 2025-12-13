import type { Config } from '@prisma/client';

const config: Config = {
  datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
};

export default config;