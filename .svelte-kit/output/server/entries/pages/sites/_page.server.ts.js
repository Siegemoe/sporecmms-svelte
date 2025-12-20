import { c as createRequestPrisma } from "../../../chunks/prisma.js";
import { f as fail } from "../../../chunks/index.js";
import { r as requireAuth, i as isManagerOrAbove } from "../../../chunks/guards.js";
import { l as logAudit } from "../../../chunks/audit.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const sites = await prisma.site.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          units: true,
          buildings: true,
          assets: true
        }
      },
      units: {
        include: {
          _count: {
            select: { assets: true }
          }
        }
      },
      buildings: {
        include: {
          _count: {
            select: { units: true }
          }
        }
      }
    }
  });
  return { sites };
};
const actions = {
  create: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const name = formData.get("name");
    if (!name || name.trim() === "") {
      return fail(400, { error: "Site name is required" });
    }
    const site = await prisma.site.create({
      data: {
        name: name.trim(),
        organizationId: event.locals.user.organizationId
      }
    });
    await logAudit(event.locals.user.id, "SITE_CREATED", {
      siteId: site.id,
      name: site.name
    });
    return { success: true, site };
  },
  delete: async (event) => {
    if (!isManagerOrAbove(event)) {
      return fail(403, { error: "Permission denied. Only managers can delete sites." });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const siteId = formData.get("siteId");
    if (!siteId) {
      return fail(400, { error: "Site ID is required" });
    }
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { name: true }
    });
    await prisma.site.delete({
      where: { id: siteId }
    });
    await logAudit(event.locals.user.id, "SITE_DELETED", {
      siteId,
      name: site?.name
    });
    return { success: true };
  },
  update: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const siteId = formData.get("siteId");
    const name = formData.get("name");
    if (!siteId) {
      return fail(400, { error: "Site ID is required" });
    }
    if (!name || name.trim() === "") {
      return fail(400, { error: "Site name is required" });
    }
    const site = await prisma.site.update({
      where: { id: siteId },
      data: { name: name.trim() }
    });
    return { success: true, site };
  }
};
export {
  actions,
  load
};
