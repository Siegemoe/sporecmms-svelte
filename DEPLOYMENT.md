# Production Deployment Guide

## Database Setup

### 1. Set Environment Variables in Cloudflare Pages

Go to your Cloudflare Pages dashboard → Settings → Environment Variables and add:

**Production Secrets:**
```
DATABASE_URL = your_postgresql_connection_string
DIRECT_URL = your_postgresql_connection_string
ACCELERATE_URL = your_prisma_accelerate_url (optional)
NODE_ENV = production
```

### 2. Apply Database Migration

Run this command locally (it will update your production database):

```bash
npx prisma migrate deploy
```

### 3. Seed Production Database

Run the seed script to populate your database:

```bash
npm run db:seed
```

This will create:
- **Spore Test Org** (zack@sporecmms.com / admin123456)
  - Misty Cove site with 38 rooms
  - No assets or work orders (clean for demo)

- **Random Data Corp** (owner@randomdatacorp.com / password123)
  - Large dataset with 500+ assets and 800+ work orders
  - Full organizational structure

## Quick Deployment Checklist

- [ ] Environment variables set in Cloudflare Pages
- [ ] Database migration applied: `npx prisma migrate deploy`
- [ ] Database seeded: `npm run db:seed`
- [ ] Code deployed: `git push origin master`

## Access After Deployment

Once complete, you can access:

1. **Login Page**: https://your-domain.pages.dev/auth/login
2. **Demo Account**: zack@sporecmms.com / admin123456
3. **Test Account**: owner@randomdatacorp.com / password123

## Troubleshooting

### 500 Errors
- Check environment variables are set correctly
- Verify database connection string
- Ensure migration was applied

### CSP Errors
- Fixed with `_headers` file
- Should auto-resolve after deployment

### Database Connection Issues
- Make sure PostgreSQL allows connections from Cloudflare
- Check connection pool settings if using
- Verify Direct URL is configured correctly
