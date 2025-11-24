import { p as prisma } from "./prisma.js";
async function logAudit(userId, action, details) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: details || null
      }
    });
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}
export {
  logAudit as l
};
