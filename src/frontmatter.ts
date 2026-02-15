import {App, TFile} from "obsidian";

export interface LocationData {
	lat: number;
	lon: number;
	address?: string;
}

interface Frontmatter {
	lat?: number;
	lon?: number;
	address?: string;
	[key: string]: unknown;
}

export async function hasLocationFrontmatter(file: TFile, app: App): Promise<boolean> {
	let hasLocation = false;
	await app.fileManager.processFrontMatter(file, (frontmatter: Frontmatter) => {
		hasLocation = frontmatter.lat !== undefined || frontmatter.lon !== undefined;
	});
	return hasLocation;
}

export async function addLocationToFrontmatter(file: TFile, app: App, data: LocationData): Promise<void> {
	await app.fileManager.processFrontMatter(file, (frontmatter: Frontmatter) => {
		frontmatter.lat = data.lat;
		frontmatter.lon = data.lon;
		if (data.address) {
			frontmatter.address = data.address;
		}
	});
}
