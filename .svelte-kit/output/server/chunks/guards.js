import { r as redirect } from "./index.js";
function requireAuth(event) {
  if (!event.locals.user) {
    throw redirect(303, "/auth/login");
  }
}
function isAdmin(event) {
  return event.locals.user?.role === "ADMIN";
}
function isManagerOrAbove(event) {
  const role = event.locals.user?.role;
  return role === "ADMIN" || role === "MANAGER";
}
export {
  isAdmin as a,
  isManagerOrAbove as i,
  requireAuth as r
};
