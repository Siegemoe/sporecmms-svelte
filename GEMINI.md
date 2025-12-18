# Spore CMMS

This project is a SvelteKit web application that uses Prisma for database management. It appears to be a Computerized Maintenance Management System (CMMS).

## Key Technologies

*   **Framework**: [SvelteKit](https://kit.svelte.dev/)
*   **Database ORM**: [Prisma](https://www.prisma.io/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Authentication**: The presence of `bcryptjs` and `cookie` suggests custom authentication.

## Getting Started

### Prerequisites

*   Node.js and npm
*   A PostgreSQL database (based on the `@prisma/adapter-pg` dependency)

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your `.env` file by copying `.env.example`.
4.  Run database migrations:
    ```bash
    npm run db:migrate
    ```

### Running the Application

*   **Development**: `npm run dev`
*   **Production**: `npm run start`

### Building the Application

```bash
npm run build
```

### Database Commands

*   **Generate Prisma Client**: `npm run db:generate`
*   **Run Migrations**: `npm run db:migrate`
*   **Open Prisma Studio**: `npm run db:studio`
*   **Seed the database**: `npm run db:seed`
*   **Reset the database**: `npm run db:reset`

## Development Conventions

*   **Code Style**: The presence of `svelte-check` and `tsconfig.json` suggests that the project uses TypeScript and has some level of static analysis.
*   **Testing**: There are no explicit testing scripts in `package.json`, but the presence of `svelte-check` indicates a focus on type safety.
*   **Database**: Migrations are managed with Prisma. Seeding is also handled via scripts.

## Deployment

This project is configured for deployment to [Cloudflare Pages](https://pages.cloudflare.com/), as indicated by the use of `@sveltejs/adapter-cloudflare` in `svelte.config.js`. The `wrangler.toml` file contains the configuration for the Cloudflare environment.

To deploy the application, you will need to set the following environment variables as secrets in your Cloudflare project:

*   `DATABASE_URL`: The connection string for your PostgreSQL database.
*   `ACCELERATE_URL`: The URL for your Prisma Accelerate connection pool.
*   `SESSION_SECRET`: A secret key for signing session cookies.
*   `NODE_ENV`: Set to `production`.

You can set these secrets using the `wrangler secret put` command:

```bash
wrangler secret put DATABASE_URL
wrangler secret put ACCELERATE_URL
wrangler secret put SESSION_SECRET
wrangler secret put NODE_ENV
```

Once you have set the environment variables, you can deploy the application by pushing your code to the Git repository that is connected to your Cloudflare Pages project.

## Architecture

The application's architecture is defined by SvelteKit's file-based routing and server-side hooks.

### Authentication and Authorization

Authentication and authorization are handled in `src/hooks.server.ts`. The logic is as follows:

*   **Public Routes**: A list of public routes is defined, which do not require authentication.
*   **Organization Routes**: A list of routes that require organization membership.
*   **Lobby Routes**: A list of routes for authenticated users who have not yet joined an organization.
*   **Session Validation**: The `validateSessionWithOrg` function is used to validate the user's session and organization membership.
*   **Redirects**: Users are redirected based on their authentication state and the route they are trying to access.

### Security

The `src/hooks.server.ts` file also implements several security measures:

*   **Security Headers**: The following security headers are added to responses in production:
    *   `X-Frame-Options`
    *   `X-Content-Type-Options`
    *   `Referrer-Policy`
    *   `Permissions-Policy`
    *   `Strict-Transport-Security`
*   **Content Security Policy (CSP)**: A CSP is implemented to mitigate cross-site scripting (XSS) and other injection attacks.
*   **Error Handling**: In production, detailed error messages are suppressed to avoid leaking sensitive information.

## Data Model

The database schema is defined in `prisma/schema.prisma` and uses PostgreSQL. The main models are:

*   **Organization**: Represents a company or organization.
*   **Site**: Represents a physical location owned by an organization.
*   **Building**: Represents a building within a site.
*   **Unit**: Represents a unit or room within a building.
*   **Asset**: Represents a piece of equipment or an asset that requires maintenance.
*   **WorkOrder**: Represents a maintenance task.
*   **User**: Represents a user of the system.
*   **Session**: Represents a user's session.
*   **AuditLog**: Logs user actions.
*   **SecurityLog**: Logs security-related events.
*   **IPBlock**: Stores IP addresses that are blocked from accessing the system.
*   **OrganizationInvite**: Stores invitations for users to join an organization.

The models are interconnected with one-to-many and many-to-many relationships. For example, an `Organization` can have multiple `Sites`, and a `Site` can have multiple `Buildings`.

## Database

The application uses Prisma to connect to a PostgreSQL database. The database connection logic is located in `src/lib/server/prisma.ts`.

### Connection Pooling

The application uses Prisma Accelerate for connection pooling, which is recommended for serverless environments like Cloudflare Workers.

### Multi-Tenancy

The application implements a multi-tenancy solution to ensure that users can only access data from their own organization. This is achieved by extending the Prisma client to automatically filter queries by `orgId`. The `createRequestPrisma` function in `src/lib/server/prisma.ts` creates a Prisma client for the current request with the appropriate tenant isolation.
