import { r as redirect } from "./index.js";
import { b as validateSession } from "./auth.js";
import { b as building } from "./environment.js";
const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/"];
const handle = async ({ event, resolve }) => {
  if (building) {
    return resolve(event);
  }
  const user = await validateSession(event.cookies);
  event.locals.user = user;
  const isPublicRoute = publicRoutes.some((route) => event.url.pathname.startsWith(route));
  if (!user && !isPublicRoute) {
    throw redirect(303, "/auth/login");
  }
  if (user && event.url.pathname.startsWith("/auth/")) {
    throw redirect(303, "/dashboard");
  }
  const response = await resolve(event);
  if (event.platform?.env?.NODE_ENV === "production" || event.url.hostname.includes("pages.dev")) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  return response;
};
const handleError = async ({ error: error2, event }) => {
  const isProduction = event.platform?.env?.NODE_ENV === "production" || event.url.hostname.includes("pages.dev");
  if (isProduction) {
    const statusCode = error2 instanceof Error && "status" in error2 ? error2.status : 500;
    return error2(statusCode, {
      message: statusCode === 500 ? "Something went wrong" : error2.message,
      code: "INTERNAL_ERROR"
    });
  }
  return error2;
};
export {
  handle,
  handleError
};
