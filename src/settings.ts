import {App, Notice, PluginSettingTab, Setting} from "obsidian";
import type CurrentLocationPlugin from "./main";
import {getCurrentPosition, reverseGeocode, formatAddress} from "./location";

export interface CurrentLocationSettings {
	autoAddFolders: string[];
	apiKey: string;
	addressFormat: string;
}

export const DEFAULT_SETTINGS: CurrentLocationSettings = {
	autoAddFolders: [],
	apiKey: '',
	addressFormat: '{city}, {state_abbr}',
};

export class CurrentLocationSettingTab extends PluginSettingTab {
	plugin: CurrentLocationPlugin;

	constructor(app: App, plugin: CurrentLocationPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Auto-add folders')
			.setDesc('Comma-separated folder paths where new notes get location auto-added (e.g. "Journal/, Travel/"). Leave empty to disable auto-add.')
			.addText(text => text
				.setPlaceholder('Journal/...')
				.setValue(this.plugin.settings.autoAddFolders.join(', '))
				.onChange(async (value) => {
					this.plugin.settings.autoAddFolders = value
						.split(',')
						.map(s => s.trim())
						.filter(s => s.length > 0);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('API key')
			.setDesc('Provide an API key from opencagedata.com to show an address.')
			.addText(text => {
				text.inputEl.type = 'password';
				text.setPlaceholder('API key...')
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value.trim();
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Address format')
			.setDesc('Format string for the address field. Available variables: {city}, {state_abbr}, {state}, {country}, {country_code}, {postcode}, {road}, {house_number}, {county}')
			.addText(text => text
				.setPlaceholder('{city}, {state_abbr}')
				.setValue(this.plugin.settings.addressFormat)
				.onChange(async (value) => {
					this.plugin.settings.addressFormat = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Test location')
			.setDesc('Fetch your current location.')
			.addButton(button => button
				.setButtonText('Test')
				.onClick(async () => {
					try {
						const pos = await getCurrentPosition();
						const lines = [`lat: ${pos.lat}`, `lon: ${pos.lon}`];

						if (this.plugin.settings.apiKey) {
							const components = await reverseGeocode({lat: pos.lat, lon: pos.lon, apiKey: this.plugin.settings.apiKey});
							if (components) {
								lines.push(`address: ${formatAddress({components, format: this.plugin.settings.addressFormat})}`);
							}
						}

						new Notice(lines.join('\n'), 8000);
					} catch (e) {
						new Notice(`Location error: ${e instanceof Error ? e.message : String(e)}`, 5000);
					}
				}));
	}
}
