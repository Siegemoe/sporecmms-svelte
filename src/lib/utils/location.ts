/**
 * Format a location for display based on available asset/unit/building/site data
 * Returns the most specific location information available
 *
 * Priority: Asset > Building > Unit > Site
 *
 * @param asset - Asset object with optional name
 * @param unit - Unit object with roomNumber, name, building, and site
 * @param building - Building object with name and optional site
 * @param site - Site object with name
 * @returns Formatted location string
 */
export function formatLocation(
	asset?: { name?: string | null } | null,
	unit?: { roomNumber?: string | null; name?: string | null; building?: { name?: string | null } | null; site?: { name?: string | null } | null } | null,
	building?: { name?: string | null } | null,
	site?: { name?: string | null } | null
): string {
	// Asset takes priority
	if (asset?.name) {
		return asset.name;
	}

	// Building with optional site
	if (building?.name) {
		return site?.name ? `${building.name} - ${site.name}` : building.name;
	}

	// Unit with full hierarchy
	if (unit) {
		const parts = [`Unit ${unit.roomNumber ?? '?'}`];
		if (unit.name) parts.push(unit.name);
		if (unit.building?.name) parts.push(unit.building.name);
		if (unit.site?.name) parts.push(unit.site.name);
		return parts.join(' • ');
	}

	// Site only
	if (site?.name) {
		return site.name;
	}

	return 'N/A';
}
