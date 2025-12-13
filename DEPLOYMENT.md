# Production Deployment Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudflare account (if deploying to Cloudflare Workers)
- Prisma Accelerate (required for Cloudflare Workers deployment)

## Dual Runtime Support

This application supports both Node.js and Cloudflare Workers runtimes through the refactored Prisma client implementation in [`src/lib/server/prisma.ts`](src/lib/server/prisma.ts:1). The runtime is automatically detected using the [`isCloudflareWorker()`](src/lib/server/prisma.ts:5) function.

### Runtime Differences
- **Node.js**: Uses standard Prisma client with direct database connection
- **Cloudflare Workers**: Uses Prisma Edge client with Accelerate extension for optimal performance

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database (Required for both runtimes)
DATABASE_URL="postgresql://username:password@host:port/database"

# Prisma Accelerate URL (Required for Cloudflare Workers only)
# Get this from your Prisma Cloud dashboard after setting up Accelerate
# Format: https://xxxxxxxx.prisma-data.net/?api_key=xxxxxxxx
ACCELERATE_URL=""

# Node environment
NODE_ENV="production"

# Session Secret (Required for authentication)
SESSION_SECRET="your-secure-random-string-here"

# Optional: Database connection pool size (Node.js only)
DATABASE_POOL_SIZE=10
```

### Environment Variable Locations
- **Node.js deployment**: Set in `.env` file or system environment
- **Cloudflare Workers**: Set as secrets using `wrangler secret put` commands

## Database Setup

1. Create a PostgreSQL database
2. Set your DATABASE_URL in the environment
3. Run database migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

## Prisma Accelerate Configuration (Required for Cloudflare Workers)

1. Sign up for Prisma Accelerate at [https://www.prisma.io/accelerate](https://www.prisma.io/accelerate)
2. Create a new Accelerate project and connect it to your database
3. Copy the Accelerate URL from your Prisma Cloud dashboard
4. Set the `ACCELERATE_URL` environment variable

For detailed Accelerate setup instructions, see the [official Prisma Accelerate documentation](https://www.prisma.io/docs/accelerate/getting-started).

## Local Development (Node.js)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# For production-like testing locally
npm run build
npm start
```

## Node.js Production Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Cloudflare Workers Deployment

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Set required secrets:
```bash
wrangler secret put DATABASE_URL
wrangler secret put ACCELERATE_URL
wrangler secret put SESSION_SECRET
wrangler secret put NODE_ENV  # Set to "production"
```

4. Deploy:
```bash
npm run build
npx wrangler deploy
```

## Database Seeding

For both runtimes, use the Node.js client for seeding operations:

```bash
# Seed database using Node.js client
npm run db:seed

# Reset and reseed
npm run db:reset
```

The seeding script uses [`createNodePrismaClient()`](src/lib/server/prisma.ts:177) to ensure it always uses the Node.js client even when imported from edge-compatible code.

## Important Notes

- **Tenant Isolation**: The application implements automatic tenant filtering through the [`createPrismaClient()`](src/lib/server/prisma.ts:95) function, ensuring users can only access their organization's data.
- **Lazy Initialization**: Prisma clients are initialized on-demand using the singleton pattern in [`getPrismaSingleton()`](src/lib/server/prisma.ts:62).
- **Logging**: Query logging is enabled in development mode (`NODE_ENV=development`) and limited to warnings and errors in production.
- **Session Management**: Authentication is properly configured with session management using the `SESSION_SECRET`.
- **WebSocket Support**: WebSocket functionality is currently disabled in this deployment configuration.