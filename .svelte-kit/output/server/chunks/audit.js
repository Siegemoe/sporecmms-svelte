import { g as getPrisma } from "./prisma.js";
import { S as SecurityManager } from "./security.js";
async function logAudit(userId, action, details) {
  try {
    const client = await getPrisma();
    await client.auditLog.create({
      data: {
        userId,
        action,
        details
      }
    });
    const security = SecurityManager.getInstance();
    const privilegedActions = [
      "USER_CREATED",
      "USER_UPDATED",
      "USER_ROLE_CHANGED",
      "USER_DELETED",
      "WORK_ORDER_DELETED",
      "ASSET_DELETED",
      "SITE_DELETED",
      "ROOM_DELETED"
    ];
    if (privilegedActions.includes(action)) {
      await security.logSecurityEvent({
        action: `PRIVILEGED_ACTION: ${action}`,
        details: {
          auditAction: action,
          auditDetails: details
        },
        severity: "WARNING",
        userId
      });
    }
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}
export {
  logAudit as l
};
