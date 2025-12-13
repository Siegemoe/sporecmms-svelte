# Prisma Performance Optimization Guide

## Current Setup
- **Prisma Version**: 7.1.0
- **Prisma Accelerate**: ✅ Configured
- **Connection Pooling**: 10 connections
- **Database**: PostgreSQL via Prisma Cloud

## Query Optimization Techniques

### 1. Use `select` for Specific Fields
❌ Bad:
```typescript
const users = await prisma.user.findMany();
```

✅ Good:
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true
  }
});
```

### 2. Optimize Count Queries
❌ Bad:
```typescript
const count = await prisma.workOrder.findMany();
return count.length;
```

✅ Good:
```typescript
const count = await prisma.workOrder.count();
```

### 3. Batch Operations for Multiple Queries
❌ Bad:
```typescript
const users = await prisma.user.findMany();
const workOrders = await prisma.workOrder.findMany();
```

✅ Good:
```typescript
const [users, workOrders] = await Promise.all([
  prisma.user.findMany(),
  prisma.workOrder.findMany()
]);
```

### 4. Use `include` Wisely
❌ Bad:
```typescript
const workOrders = await prisma.workOrder.findMany({
  include: {
    asset: true,
    asset: {
      room: true,
      room: {
        site: true,
        site: {
          org: true
        }
      }
    }
  }
});
```

✅ Good:
```typescript
const workOrders = await prisma.workOrder.findMany({
  select: {
    id: true,
    title: true,
    status: true,
    asset: {
      select: {
        id: true,
        name: true,
        room: {
          select: {
            id: true,
            name: true,
            site: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    }
  }
});
```

### 5. Implement Pagination
❌ Bad:
```typescript
const allRecords = await prisma.workOrder.findMany();
```

✅ Good:
```typescript
const page = 1;
const pageSize = 20;
const records = await prisma.workOrder.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
});
```

### 6. Use Transactions for Related Operations
```typescript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ ... });
  const org = await tx.org.create({ ... });
  return { user, org };
});
```

### 7. Enable Query Result Caching
For frequently accessed data like user profiles:

```typescript
import { cache } from '$lib/cache'; // Implement caching layer

async function getUserProfile(userId: string) {
  const cacheKey = `user-profile-${userId}`;

  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  // Query if not in cache
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true
    }
  });

  // Cache for 5 minutes
  await cache.set(cacheKey, user, 300000);
  return user;
}
```

### 8. Optimize Indexes
Ensure your database has indexes on frequently queried fields:

```sql
-- Create indexes for common queries
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_workorder_org_status ON "WorkOrder"(orgId, status);
CREATE INDEX idx_asset_room ON "Asset"(roomId);
CREATE INDEX idx_workorder_updated_at ON "WorkOrder"(updatedAt DESC);
```

### 9. Use Edge Caching for Read-Heavy Operations
```typescript
// For Cloudflare Workers
export const config: Config = {
  acceleratorUrl: process.env.ACCELERATE_URL,
  datasources: {
    db: {
      url: process.env.ACCELERATE_URL
    }
  },
  // Enable edge caching
  cacheStrategy: {
    ttl: 300, // 5 minutes cache
    swr: true // Stale-while-revalidate
  }
};
```

### 10. Monitor Performance
Use the metrics class we created to track slow queries and optimize them.

## Recommended Changes for Your Codebase

### Dashboard Route (src/routes/dashboard/+page.server.ts)
- ✅ Already using Promise.all for parallel queries
- ✅ Consider adding pagination for work orders
- ✅ Add caching for dashboard stats (cache for 30 seconds)

### Work Orders Route
- ✅ Implement proper pagination
- ✅ Add indexes for better performance
- ✅ Cache frequently accessed work orders

### Assets Management
- ✅ Optimize asset listing with pagination
- ✅ Use selective fields in queries
- ✅ Batch operations for bulk updates

## Performance Monitoring Checklist

- [ ] Add PrismaMetrics to your main client setup
- [ ] Monitor query times (>100ms threshold)
- [ ] Check for N+1 query patterns
- [ ] Verify database indexes are optimal
- [ ] Monitor Prisma Accelerate cache hit rates
- [ ] Set up alerts for performance degradation

## Expected Improvements

With these optimizations:
- **50-80% reduction** in query times through selective field loading
- **90% reduction** in data transfer through field selection
- **Edge caching** provides global sub-100ms response times
- **Connection pooling** reduces connection overhead
- **Batch operations** minimize round trips

## Next Steps

1. Implement the PrismaMetrics class
2. Apply query optimizations to your routes
3. Add database indexes if missing
4. Monitor performance after deployment
5. Continuously optimize based on metrics