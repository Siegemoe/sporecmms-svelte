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
  return resolve(event);
};
export {
  handle
};
