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
function canUpdateWorkOrder(userId, userRole, workOrderCreatedById, workOrderAssignedToId) {
  return userRole === "ADMIN" || userRole === "MANAGER" || userId === workOrderCreatedById || userId === workOrderAssignedToId;
}
function canAssignWorkOrder(userRole) {
  return userRole === "ADMIN" || userRole === "MANAGER";
}
function canDeleteWorkOrder(userRole) {
  return userRole === "ADMIN" || userRole === "MANAGER";
}
export {
  isAdmin as a,
  canAssignWorkOrder as b,
  canUpdateWorkOrder as c,
  canDeleteWorkOrder as d,
  isManagerOrAbove as i,
  requireAuth as r
};
