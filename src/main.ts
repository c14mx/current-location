import {App, MarkdownView, Modal, Notice, Plugin, Setting, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, CurrentLocationSettings, CurrentLocationSettingTab} from "./settings";
import {getCurrentPosition, reverseGeocode, formatAddress} from "./location";
import {addLocationToFrontmatter, hasLocationFrontmatter} from "./frontmatter";

class OverwriteLocationModal extends Modal {
	private confirmed = false;
	private resolve: (value: boolean) => void;

	constructor(app: App, resolve: (value: boolean) => void) {
		super(app);
		this.resolve = resolve;
	}

	onOpen(): void {
		const {contentEl} = this;
		contentEl.createEl('p', {text: 'This note already has location data. Would you like to overwrite it with your current location?'});

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Cancel')
				.onClick(() => this.close()))
			.addButton(btn => btn
				.setButtonText('Overwrite')
				.setWarning()
				.onClick(() => {
					this.confirmed = true;
					this.close();
				}));
	}

	onClose(): void {
		this.resolve(this.confirmed);
	}
}

function confirmOverwrite(app: App): Promise<boolean> {
	return new Promise(resolve => {
		new OverwriteLocationModal(app, resolve).open();
	});
}

export default class CurrentLocationPlugin extends Plugin {
	settings: CurrentLocationSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addCommand({
			id: 'add-location',
			name: 'Add location',
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view?.file) {
					if (!checking) {
						void this.manualAddLocation(view.file);
					}
					return true;
				}
				return false;
			}
		});

		this.registerEvent(
			this.app.vault.on('create', (file) => {
				if (!(file instanceof TFile) || file.extension !== 'md') return;
				if (!this.isInAutoAddFolder(file)) return;
				void this.addLocationToFile(file);
			})
		);

		this.addSettingTab(new CurrentLocationSettingTab(this.app, this));
	}

	private isInAutoAddFolder(file: TFile): boolean {
		if (this.settings.autoAddFolders.length === 0) return false;

		const filePath = file.path;
		return this.settings.autoAddFolders.some(folder => {
			const normalized = folder.endsWith('/') ? folder : folder + '/';
			return filePath.startsWith(normalized);
		});
	}

	private async manualAddLocation(file: TFile): Promise<void> {
		if (await hasLocationFrontmatter(file, this.app)) {
			const confirmed = await confirmOverwrite(this.app);
			if (!confirmed) return;
		}
		await this.addLocationToFile(file);
	}

	private async addLocationToFile(file: TFile): Promise<void> {
		try {
			const pos = await getCurrentPosition();
			let address: string | undefined;

			if (this.settings.apiKey) {
				const components = await reverseGeocode({lat: pos.lat, lon: pos.lon, apiKey: this.settings.apiKey});
				if (components) {
					address = formatAddress({components, format: this.settings.addressFormat});
				}
			}

			await addLocationToFrontmatter(file, this.app, {
				lat: pos.lat,
				lon: pos.lon,
				address,
			});

			new Notice(`Location added: ${pos.lat}, ${pos.lon}${address ? ' — ' + address : ''}`);
		} catch (e) {
			new Notice(`Failed to add location: ${e instanceof Error ? e.message : String(e)}`, 5000);
		}
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<CurrentLocationSettings>);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
