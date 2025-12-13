import { p as prisma } from "./prisma.js";
async function logAudit(userId, action, details) {
  try {
    const client = await prisma;
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
