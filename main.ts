import { App, FileSystemAdapter, normalizePath, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import path from 'path';
import { UpdateRecorder } from 'Services/UpdateRecorder';

// Remember to rename these classes and interfaces!

interface CustomSyncPluginSettings {
	_syncServerUrl_azure?: string; // Azure sync server URL
	_azureToken: string;

	_syncServerUrl_local?: string; // local sync server URL
}

const DEFAULT_SETTINGS: CustomSyncPluginSettings = {
	_azureToken: 'default'
}

export default class CustomSyncPlugin extends Plugin {
	settings: CustomSyncPluginSettings;
	_updateRecorder: UpdateRecorder;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "obs-plugin-dump",
			name: "Dump file records",
			callback: () => {
				// new SampleModal(this.app).open();
				this._updateRecorder.dumpRecords();
			},
		});

		// ===========================================================================================
		this.addCommand({
			id: "obs-plugin-filepath-to-clipboard",
			name: "Copy full file path to clipboard",
			callback: () => {
				// const folder = this.app.vault.adapter.getResourcePath() || "<n.a.>";


				const adapter = this.app.vault.adapter;
				if (!(adapter instanceof FileSystemAdapter)) {
					new Notice("This command only works with the FileSystemAdapter.");
					return;
				}
				const vaultPath = adapter.getBasePath(); // This is safe after the cast

				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					new Notice("No active file to copy path from.");
					return;
				}
				const fullPath = path.join(vaultPath, normalizePath(activeFile.path));

				navigator.clipboard.writeText(fullPath).then(() => {
					new Notice(`Copied: ${fullPath}`);
				}).catch(err => {
					new Notice(`Failed to copy: ${err}`);
				});
			},
		});


		// ===========================================================================================
		this._updateRecorder = new UpdateRecorder(this);
		this._updateRecorder.RegisterEvents();
		

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: CustomSyncPlugin;

	constructor(app: App, plugin: CustomSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Token for Azure Blob Storage")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter token")
					.setValue(this.plugin.settings._azureToken)
					.onChange(async (value) => {
						this.plugin.settings._azureToken = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Local Sync Server URL")
			.setDesc(
				"URL to local sync server, which is initially contacted before falling back to Azure"
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter a value for setting #2")
					.setValue(this.plugin.settings._syncServerUrl_local || "")
					.onChange(async (value) => {
						this.plugin.settings._syncServerUrl_local = value;
						await this.plugin.saveSettings();
					})
			);
	}
}