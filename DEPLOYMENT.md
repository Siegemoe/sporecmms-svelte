# Production Deployment Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudflare account (if deploying to Cloudflare Workers)

## Environment Variables
Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"
NODE_ENV="production"
```

## Database Setup
1. Create a PostgreSQL database
2. Set your DATABASE_URL in the .env file
3. Run database migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

## Local Production Build
```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Cloudflare Deployment
1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Deploy:
```bash
npm run build
npx wrangler deploy
```

## Important Notes
- The WebSocket functionality is currently disabled
- Authentication is properly configured with session management
- Ensure your DATABASE_URL includes the correct schema parameter if needed