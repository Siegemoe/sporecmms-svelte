import { g as getPrisma } from "./prisma.js";
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
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}
export {
  logAudit as l
};
