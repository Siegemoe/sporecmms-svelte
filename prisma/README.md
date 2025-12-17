# Database Seed Scripts

This directory contains seed scripts for populating the CMMS database with test data.

## Available Scripts

### 1. `seed.ts` (Main Seed Script)
- **Purpose**: Comprehensive seed script for development/testing
- **Organizations**:
  - Spore Test Org (1 owner, 1 site, 38 rooms)
  - Random Data Corp (1 owner, 5 managers, 40 technicians, 5 read-only users, 2 sites with extensive data)
- **Data Volume**: ~800+ work orders, 500+ assets
- **Usage**:
  ```bash
  npm run db:seed
  # or
  npm run db:seed:full
  ```

### 2. `seed-production.ts` (Production-Optimized)
- **Purpose**: Optimized for production environments with performance enhancements
- **Features**:
  - Batch processing (configurable batch size)
  - Retry logic for failed operations
  - Progress tracking and performance metrics
  - Memory-efficient UUID generation
  - Configurable options (skip cleanup, audit logs, etc.)
- **Usage**:
  ```bash
  npm run db:seed:prod-full
  ```

### 3. `seed-misty-cove.ts` (Legacy)
- **Purpose**: Legacy seed script for Misty Cove only
- **Note**: Uses old schema, kept for reference

### 4. `seed-production-users.ts` (Legacy)
- **Purpose**: Legacy production seed script
- **Note**: Uses old schema, kept for reference

## Configuration

### Production Seed Options
The `seed-production.ts` script has configurable options at the top:

```typescript
const PRODUCTION_CONFIG = {
  batchSize: 100, // Number of records per batch
  maxRetries: 3, // Number of retries for failed operations
  delayBetweenBatches: 100, // ms delay between batches
  skipCleanup: false, // Skip database cleanup
  createAuditLogs: false, // Skip audit logs for speed
};
```

## Login Credentials

### Spore Test Org
- **Owner Email**: zack@sporecmms.com
- **Password**: admin123456
- **Site**: Misty Cove
- **Rooms**: 38 total (101-133 + special rooms)

### Random Data Corp
- **Owner Email**: owner@randomdatacorp.com
- **Password**: password123
- **Managers**: manager1-5@randomdatacorp.com
- **Technicians**: tech1-40@randomdatacorp.com
- **Read-only**: readonly1-5@randomdatacorp.com
- **All Random Data Corp users use**: password123

## Data Structure

### Organizations, Sites, Buildings, Units (Rooms)
The seed scripts follow the new schema structure:
- Organizations contain Sites
- Sites contain Buildings and Units
- Buildings contain Units
- Units contain Assets

### Assets
- Types: HVAC, ELECTRICAL, PLUMBING, FIRE_SAFETY, ELEVATOR, SECURITY_SYSTEM, OTHER
- Status: OPERATIONAL, NEEDS_MAINTENANCE, OUT_OF_SERVICE
- Each asset is assigned to a Unit

### Work Orders
- Status: PENDING, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED
- Priority: LOW, MEDIUM, HIGH, EMERGENCY
- Each work order has:
  - Created by (Manager/Admin)
  - Assigned to (Technician, 80% assigned)
  - Optional Asset
  - Due dates
  - History via WorkOrderEvents

## Running the Seeds

### Full Reset and Seed
```bash
# Reset database and run main seed
npm run db:reset

# Reset database and run production seed
prisma migrate reset --force && npm run db:seed:prod-full
```

### Individual Seeds
```bash
# Run main seed (without reset)
npm run db:seed

# Run production seed (without reset)
npm run db:seed:prod-full

# Run legacy production users
npm run db:seed:prod
```

## Performance Notes

The production seed script includes:
- Batch processing to prevent memory issues
- Exponential backoff for retries
- Progress tracking
- Performance metrics

Typical performance:
- Full seed: ~800+ records in < 30 seconds
- Production seed: Optimized for even faster execution

## Troubleshooting

1. **UUID errors**: Ensure the uuid package is installed (`npm install uuid @types/uuid`)
2. **Database connection**: Check DATABASE_URL environment variable
3. **Permission errors**: Ensure the database user has write permissions
4. **Memory issues**: Use the production seed script with smaller batch sizes

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string

Optional:
- `DIRECT_URL`: Direct database connection URL
- `NODE_ENV`: Set to 'development' or 'production'