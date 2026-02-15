import {requestUrl} from "obsidian";

export interface Coordinates {
	lat: number;
	lon: number;
}

export interface AddressComponents {
	city: string;
	state_abbr: string;
	state: string;
	country: string;
	country_code: string;
	postcode: string;
	road: string;
	house_number: string;
	county: string;
}

interface ReverseGeocodeParams {
	lat: number;
	lon: number;
	apiKey: string;
}

interface FormatAddressParams {
	components: AddressComponents;
	format: string;
}

interface OpenCageComponents {
	city?: string;
	town?: string;
	village?: string;
	hamlet?: string;
	state_code?: string;
	state?: string;
	country?: string;
	country_code?: string;
	postcode?: string;
	road?: string;
	house_number?: string;
	county?: string;
}

interface OpenCageResult {
	components: OpenCageComponents;
}

interface OpenCageResponse {
	results?: OpenCageResult[];
}

function requestPosition(highAccuracy: boolean, timeout: number): Promise<Coordinates> {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				resolve({
					lat: position.coords.latitude,
					lon: position.coords.longitude,
				});
			},
			(error) => reject(new Error(error.message)),
			{enableHighAccuracy: highAccuracy, timeout}
		);
	});
}

export async function getCurrentPosition(): Promise<Coordinates> {
	if (!navigator.geolocation) {
		throw new Error('Geolocation is not supported on this device.');
	}

	try {
		return await requestPosition(true, 10000);
	} catch {
		try {
			return await requestPosition(false, 15000);
		} catch (e) {
			throw new Error(`Geolocation failed: ${e instanceof Error ? e.message : String(e)}`);
		}
	}
}

export async function reverseGeocode({lat, lon, apiKey}: ReverseGeocodeParams): Promise<AddressComponents | null> {
	const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${encodeURIComponent(apiKey)}&no_annotations=1&limit=1`;

	const response = await requestUrl({url});
	const data = response.json as OpenCageResponse;

	if (!data.results || data.results.length === 0) {
		return null;
	}

	const c = data.results[0]?.components;
	if (!c) return null;

	return {
		city: c.city ?? c.town ?? c.village ?? c.hamlet ?? '',
		state_abbr: c.state_code ?? '',
		state: c.state ?? '',
		country: c.country ?? '',
		country_code: c.country_code?.toUpperCase() ?? '',
		postcode: c.postcode ?? '',
		road: c.road ?? '',
		house_number: c.house_number ?? '',
		county: c.county ?? '',
	};
}

export function formatAddress({components, format}: FormatAddressParams): string {
	let result = format;
	for (const key of Object.keys(components) as Array<keyof AddressComponents>) {
		result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), components[key]);
	}
	return result;
}
