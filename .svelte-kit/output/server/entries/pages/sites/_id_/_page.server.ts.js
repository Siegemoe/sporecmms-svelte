import { c as createRequestPrisma } from "../../../../chunks/prisma.js";
import { e as error, f as fail } from "../../../../chunks/index.js";
import { r as requireAuth } from "../../../../chunks/guards.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const { id } = event.params;
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      Building: {
        orderBy: { name: "asc" }
      },
      Unit: {
        orderBy: [
          { floor: "asc" },
          { roomNumber: "asc" }
        ],
        include: {
          _count: {
            select: { Asset: true }
          }
        }
      },
      _count: {
        select: {
          Building: true,
          Unit: true,
          Asset: true
        }
      }
    }
  });
  if (!site) {
    throw error(404, "Site not found");
  }
  const buildingsWithUnits = site.Building.map((building) => ({
    id: building.id,
    name: building.name,
    description: building.description,
    units: site.Unit.filter((u) => u.buildingId === building.id)
  }));
  const unassignedUnits = site.Unit.filter((u) => !u.buildingId);
  return { site, buildingsWithUnits, unassignedUnits };
};
const actions = {
  createUnit: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id: siteId } = event.params;
    const roomNumber = formData.get("roomNumber");
    const name = formData.get("name");
    const floor = formData.get("floor");
    const buildingId = formData.get("buildingId");
    if (!roomNumber || roomNumber.trim() === "") {
      return fail(400, { error: "Room number is required" });
    }
    if (buildingId) {
      const building = await prisma.building.findFirst({
        where: { id: buildingId, siteId }
      });
      if (!building) {
        return fail(400, { error: "Invalid building" });
      }
    }
    const unit = await prisma.unit.create({
      data: {
        roomNumber: roomNumber.trim(),
        name: name?.trim() || null,
        floor: floor ? parseInt(floor) : null,
        siteId,
        buildingId: buildingId || null,
        updatedAt: /* @__PURE__ */ new Date()
      }
    });
    return { success: true, unit };
  },
  updateSite: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id } = event.params;
    const name = formData.get("name");
    if (!name || name.trim() === "") {
      return fail(400, { error: "Site name is required" });
    }
    const site = await prisma.site.update({
      where: { id },
      data: { name: name.trim() }
    });
    return { success: true, site };
  },
  deleteUnit: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const unitId = formData.get("unitId");
    if (!unitId) {
      return fail(400, { error: "Unit ID is required" });
    }
    await prisma.unit.delete({
      where: { id: unitId }
    });
    return { success: true };
  },
  createBuilding: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id: siteId } = event.params;
    const name = formData.get("name");
    const description = formData.get("description");
    if (!name || name.trim() === "") {
      return fail(400, { error: "Building name is required" });
    }
    const building = await prisma.building.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        siteId,
        updatedAt: /* @__PURE__ */ new Date()
      }
    });
    return { success: true, building };
  },
  updateBuilding: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id: siteId } = event.params;
    const buildingId = formData.get("buildingId");
    const name = formData.get("name");
    const description = formData.get("description");
    if (!buildingId) {
      return fail(400, { error: "Building ID is required" });
    }
    if (!name || name.trim() === "") {
      return fail(400, { error: "Building name is required" });
    }
    const existingBuilding = await prisma.building.findFirst({
      where: { id: buildingId, siteId }
    });
    if (!existingBuilding) {
      return fail(404, { error: "Building not found" });
    }
    const building = await prisma.building.update({
      where: { id: buildingId },
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    });
    return { success: true, building };
  },
  deleteBuilding: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id: siteId } = event.params;
    const buildingId = formData.get("buildingId");
    if (!buildingId) {
      return fail(400, { error: "Building ID is required" });
    }
    const existingBuilding = await prisma.building.findFirst({
      where: { id: buildingId, siteId }
    });
    if (!existingBuilding) {
      return fail(404, { error: "Building not found" });
    }
    await prisma.unit.updateMany({
      where: { buildingId },
      data: { buildingId: null }
    });
    await prisma.building.delete({
      where: { id: buildingId }
    });
    return { success: true };
  },
  updateUnit: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const unitId = formData.get("unitId");
    const roomNumber = formData.get("roomNumber");
    const name = formData.get("name");
    const floor = formData.get("floor");
    const buildingId = formData.get("buildingId");
    if (!unitId) {
      return fail(400, { error: "Unit ID is required" });
    }
    if (!roomNumber || roomNumber.trim() === "") {
      return fail(400, { error: "Room number is required" });
    }
    const existingUnit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: { siteId: true }
    });
    if (!existingUnit || existingUnit.siteId !== event.params.id) {
      return fail(404, { error: "Unit not found" });
    }
    if (buildingId) {
      const building = await prisma.building.findFirst({
        where: { id: buildingId, siteId: event.params.id }
      });
      if (!building) {
        return fail(400, { error: "Invalid building" });
      }
    }
    const unit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        roomNumber: roomNumber.trim(),
        name: name?.trim() || null,
        floor: floor ? parseInt(floor) : null,
        buildingId: buildingId || null
      }
    });
    return { success: true, unit };
  }
};
export {
  actions,
  load
};
