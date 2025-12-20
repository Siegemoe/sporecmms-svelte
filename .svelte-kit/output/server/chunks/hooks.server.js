import { r as redirect } from "./index.js";
import { b as validateSessionWithOrg } from "./auth.js";
import { d as building } from "./internal.js";
const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/", "/favicon.ico", "/favicon.png"];
const orgRoutes = ["/dashboard", "/work-orders", "/sites", "/assets", "/users", "/audit-log"];
const lobbyRoutes = ["/onboarding", "/join-organization"];
const handle = async ({ event, resolve }) => {
  if (building) {
    return resolve(event);
  }
  if (event.url.pathname === "/favicon.ico" || event.url.pathname === "/favicon.png") {
    return resolve(event);
  }
  try {
    console.log("[Auth] Checking cookies:", event.cookies.get("spore_session") ? "Found" : "Missing");
    const authResult = await validateSessionWithOrg(event.cookies);
    console.log("[Auth] Result:", authResult.state, authResult.user?.email);
    event.locals.user = authResult.user;
    event.locals.authState = authResult.state;
    event.locals.organizations = authResult.organizations || [];
    event.locals.currentOrganization = authResult.currentOrganization || null;
  } catch (err) {
    console.error("Auth validation error:", err);
    event.locals.user = null;
    event.locals.authState = "unauthenticated";
    event.locals.organizations = [];
    event.locals.currentOrganization = null;
    event.locals.authError = true;
  }
  const isPublicRoute = publicRoutes.some((route) => event.url.pathname.startsWith(route));
  const isOrgRoute = orgRoutes.some((route) => event.url.pathname.startsWith(route));
  const isLobbyRoute = lobbyRoutes.some((route) => event.url.pathname.startsWith(route));
  if (event.locals.authState === "unauthenticated" && !isPublicRoute) {
    throw redirect(303, "/auth/login");
  }
  if (event.locals.user && event.url.pathname.startsWith("/auth/")) {
    if (event.locals.authState === "lobby") {
      throw redirect(303, "/onboarding");
    }
    throw redirect(303, "/dashboard");
  }
  if (event.locals.authState === "lobby" && !isLobbyRoute && !isPublicRoute) {
    throw redirect(303, "/onboarding");
  }
  if (event.locals.authState === "org_member" && isLobbyRoute) {
    throw redirect(303, "/dashboard");
  }
  if (event.locals.authState === "org_member" && isOrgRoute) {
    if (!event.locals.currentOrganization) {
      throw redirect(303, "/select-organization");
    }
  }
  const response = await resolve(event);
  if (event.platform?.env?.NODE_ENV === "production" || event.url.hostname.includes("pages.dev")) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com",
      // unsafe-inline needed for use:enhance form handling
      "style-src 'self' 'unsafe-inline'",
      // unsafe-inline needed for Svelte styling
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.prisma-data.net https://cloudflareinsights.com",
      // Allow Prisma Accelerate and Cloudflare Analytics
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ");
    response.headers.set("Content-Security-Policy", csp);
  }
  return response;
};
const handleError = async ({ error: err, event }) => {
  const isProduction = event.platform?.env?.NODE_ENV === "production" || event.url.hostname.includes("pages.dev");
  if (isProduction) {
    const statusCode = err instanceof Error && "status" in err ? err.status : 500;
    const message = statusCode === 500 ? "Something went wrong" : err.message;
    return {
      message,
      code: "INTERNAL_ERROR"
    };
  }
};
export {
  handle,
  handleError
};
