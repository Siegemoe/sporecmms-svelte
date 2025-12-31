import type { WorkOrder, Asset, Unit, Building, Site } from '@prisma/client';

/**
 * Transformed WorkOrder with PascalCase relations converted to lowercase
 */
export type WorkOrderWithRelations = WorkOrder & {
	asset?: AssetWithRoom | null;
	building?: BuildingWithSite | null;
	unit?: UnitWithRelations | null;
	site?: Site | null;
};

export type AssetWithRoom = {
	id: string;
	name: string;
	description: string | null;
	type: string;
	status: string;
	purchaseDate: Date | null;
	warrantyExpiry: Date | null;
	lastMaintenance: Date | null;
	createdAt: Date;
	updatedAt: Date;
	siteId: string;
	unitId: string;
	room?: {
		id: string;
		roomNumber: string | null;
		name: string | null;
		floor: number | null;
		site?: { name: string } | null;
		building?: { name: string } | null;
	} | null;
};

export type BuildingWithSite = {
	id: string;
	name: string;
	description: string | null;
	address: string | null;
	city: string | null;
	state: string | null;
	zipCode: string | null;
	country: string | null;
	yearBuilt: number | null;
	floors: number | null;
	squareFeet: number | null;
	createdAt: Date;
	updatedAt: Date;
	siteId: string;
	site?: { name: string } | null;
};

export type UnitWithRelations = {
	id: string;
	roomNumber: string;
	name: string | null;
	floor: number | null;
	squareFeet: number | null;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
	siteId: string;
	buildingId: string | null;
	site?: { name: string } | null;
	building?: { name: string } | null;
};

/**
 * Transform a WorkOrder with Prisma relations (PascalCase) to frontend format (lowercase)
 */
export function transformWorkOrder(
	wo: WorkOrder & {
		Asset?: (Asset & { Unit?: (Unit & { Site?: Site | null; Building?: Building | null }) | null }) | null;
		Building?: (Building & { Site?: Site | null }) | null;
		Unit?: (Unit & { Site?: Site | null; Building?: Building | null }) | null;
		Site?: Site | null;
	}
): WorkOrderWithRelations {
	const result: WorkOrderWithRelations = {
		...wo,
		asset: null,
		building: null,
		unit: null,
		site: wo.Site || null
	};

	if (wo.Asset) {
		const assetData: AssetWithRoom = {
			id: wo.Asset.id,
			name: wo.Asset.name,
			description: wo.Asset.description,
			type: wo.Asset.type,
			status: wo.Asset.status,
			purchaseDate: wo.Asset.purchaseDate,
			warrantyExpiry: wo.Asset.warrantyExpiry,
			lastMaintenance: wo.Asset.lastMaintenance,
			createdAt: wo.Asset.createdAt,
			updatedAt: wo.Asset.updatedAt,
			siteId: wo.Asset.siteId,
			unitId: wo.Asset.unitId,
			room: null
		};
		if (wo.Asset.Unit) {
			assetData.room = {
				id: wo.Asset.Unit.id,
				roomNumber: wo.Asset.Unit.roomNumber,
				name: wo.Asset.Unit.name || wo.Asset.Unit.roomNumber,
				floor: wo.Asset.Unit.floor,
				site: wo.Asset.Unit.Site ? { name: wo.Asset.Unit.Site.name } : null,
				building: wo.Asset.Unit.Building ? { name: wo.Asset.Unit.Building.name } : null
			};
		}
		result.asset = assetData;
	}

	if (wo.Building) {
		result.building = {
			id: wo.Building.id,
			name: wo.Building.name,
			description: wo.Building.description,
			address: wo.Building.address,
			city: wo.Building.city,
			state: wo.Building.state,
			zipCode: wo.Building.zipCode,
			country: wo.Building.country,
			yearBuilt: wo.Building.yearBuilt,
			floors: wo.Building.floors,
			squareFeet: wo.Building.squareFeet,
			createdAt: wo.Building.createdAt,
			updatedAt: wo.Building.updatedAt,
			siteId: wo.Building.siteId,
			site: wo.Building.Site ? { name: wo.Building.Site.name } : null
		};
	}

	if (wo.Unit) {
		result.unit = {
			id: wo.Unit.id,
			roomNumber: wo.Unit.roomNumber,
			name: wo.Unit.name,
			floor: wo.Unit.floor,
			squareFeet: wo.Unit.squareFeet,
			description: wo.Unit.description,
			createdAt: wo.Unit.createdAt,
			updatedAt: wo.Unit.updatedAt,
			siteId: wo.Unit.siteId,
			buildingId: wo.Unit.buildingId,
			site: wo.Unit.Site ? { name: wo.Unit.Site.name } : null,
			building: wo.Unit.Building ? { name: wo.Unit.Building.name } : null
		};
	}

	return result;
}

/**
 * Transform multiple WorkOrders
 */
export function transformWorkOrders(
	workOrders: Array<WorkOrder & {
		Asset?: (Asset & { Unit?: (Unit & { Site?: Site | null; Building?: Building | null }) | null }) | null;
		Building?: (Building & { Site?: Site | null }) | null;
		Unit?: (Unit & { Site?: Site | null; Building?: Building | null }) | null;
		Site?: Site | null;
	}>
): WorkOrderWithRelations[] {
	return workOrders.map(transformWorkOrder);
}

/**
 * Transform an Asset with Unit to frontend format
 */
export function transformAssetWithRoom(
	asset: Asset & {
		Unit?: (Unit & { Site?: { name: string } | null; Building?: { name: string } | null }) | null;
	}
): AssetWithRoom {
	const result: AssetWithRoom = {
		id: asset.id,
		name: asset.name,
		description: asset.description,
		type: asset.type,
		status: asset.status,
		purchaseDate: asset.purchaseDate,
		warrantyExpiry: asset.warrantyExpiry,
		lastMaintenance: asset.lastMaintenance,
		createdAt: asset.createdAt,
		updatedAt: asset.updatedAt,
		siteId: asset.siteId,
		unitId: asset.unitId,
		room: null
	};

	if (asset.Unit) {
		result.room = {
			id: asset.Unit.id,
			roomNumber: asset.Unit.roomNumber,
			name: asset.Unit.name || asset.Unit.roomNumber,
			floor: asset.Unit.floor,
			site: asset.Unit.Site ? { name: asset.Unit.Site.name } : null,
			building: asset.Unit.Building ? { name: asset.Unit.Building.name } : null
		};
	}

	return result;
}

/**
 * Transform multiple Assets with Units
 */
export function transformAssetsWithRoom(
	assets: Array<Asset & {
		Unit?: (Unit & { Site?: { name: string } | null; Building?: { name: string } | null }) | null;
	}>
): AssetWithRoom[] {
	return assets.map(transformAssetWithRoom);
}

/**
 * Transform a Unit with Site/Building to frontend format
 */
export function transformUnit(unit: Unit & { Site?: { name: string } | null; Building?: { name: string } | null }): UnitWithRelations {
	return {
		id: unit.id,
		roomNumber: unit.roomNumber,
		name: unit.name,
		floor: unit.floor,
		squareFeet: unit.squareFeet,
		description: unit.description,
		createdAt: unit.createdAt,
		updatedAt: unit.updatedAt,
		siteId: unit.siteId,
		buildingId: unit.buildingId,
		site: unit.Site ? { name: unit.Site.name } : null,
		building: unit.Building ? { name: unit.Building.name } : null
	};
}

/**
 * Transform multiple Units
 */
export function transformUnits(
	units: Array<Unit & { Site?: { name: string } | null; Building?: { name: string } | null }>
): UnitWithRelations[] {
	return units.map(transformUnit);
}

/**
 * Transform a Building with Site to frontend format
 */
export function transformBuilding(building: Building & { Site?: { name: string } | null }): BuildingWithSite {
	return {
		id: building.id,
		name: building.name,
		description: building.description,
		address: building.address,
		city: building.city,
		state: building.state,
		zipCode: building.zipCode,
		country: building.country,
		yearBuilt: building.yearBuilt,
		floors: building.floors,
		squareFeet: building.squareFeet,
		createdAt: building.createdAt,
		updatedAt: building.updatedAt,
		siteId: building.siteId,
		site: building.Site ? { name: building.Site.name } : null
	};
}

/**
 * Transform multiple Buildings
 */
export function transformBuildings(
	buildings: Array<Building & { Site?: { name: string } | null }>
): BuildingWithSite[] {
	return buildings.map(transformBuilding);
}
