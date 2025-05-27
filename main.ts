import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	_syncServerUrl?: string; // Optional setting for sync server URL
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	_updateRecorder: UpdateRecorder;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "obs-plugin-dump",
			name: "Dump file records",
			callback: () => {
				// new SampleModal(this.app).open();
				this._updateRecorder.dumpRecords();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// ===========================================================================================
		this._updateRecorder = new UpdateRecorder(this);
		this._updateRecorder.RegisterEvents();
		

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, "click", (evt: MouseEvent) => {
		// 	console.log("click", evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(
		// 	window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		// );
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Setting #2')
			.setDesc('This is a description for setting #2')
			.addText(text => text
				.setPlaceholder('Enter a value for setting #2')
				.setValue(this.plugin.settings._syncServerUrl || '')
				.onChange(async (value) => {
					this.plugin.settings._syncServerUrl = value;
					await this.plugin.saveSettings();
				}));


	}
}

class UpdateRecorder {
	_plugin: MyPlugin;
	_fileRecordMap: Map<string, FileRecord> = new Map();

	constructor(private plugin: MyPlugin) {
		if (!plugin) {
			throw new Error("Plugin instance is required");
		}
		this._plugin = plugin;
	}

	public async RegisterEvents(): Promise<void> {
		this._plugin.registerEvent(this._plugin.app.vault.on("rename", this.handleRename));
		this._plugin.registerEvent(this._plugin.app.vault.on("delete", this.handleDelete));
		this._plugin.registerEvent(this._plugin.app.workspace.on("file-open", this.onFileOpen));
	}

	public dumpRecords(): string {
		if (this._fileRecordMap.size === 0) {
			console.log("No file records available.");
			return "No file records available.";
		}

		// what is the stringbuilder equivalent in JS?
		const lines: string[] = [];
		lines.push("Dumping file records:");
		
		this._fileRecordMap.forEach((record, path) => {
			lines.push(`Path: ${path}, Record: ${record.toString()}`);
		});
		
		const output = lines.join('\n');
		console.log(output);
		
		return output;
	}

	// private onFileOpen(openedFile: string): EventRef {
	private readonly onFileOpen = async (openedFile: TFile): Promise<void> => {
		
		console.log("File opened:", openedFile);

		if (!openedFile) {
			return;
		}

		this.updateData(openedFile);
	};

	// private readonly update = async (openedFile: TFile): Promise<void> => {
	// 	if (!openedFile) {
	// 		return;
	// 	}

	// 	await this.updateData(openedFile);
	// };

	private readonly updateData = async (file: TFile): Promise<void> => {
		// func only called once when file is opened
		// TODO: register a 2nd eventhandler that captures file changes

		this._fileRecordMap.set(file.path, FileRecord.record(file, FileModificationType.UPDATED));
		console.log("file udpated:", file);
	};

	private readonly handleRename = async (
		file: TAbstractFile,
		oldPath: string): Promise<void> => {

		this._fileRecordMap.set(file.path, FileRecord.record(file, FileModificationType.CREATED));
		console.log("file renamed (new -> old)", file, oldPath);
	};

	private readonly handleDelete = async (
		file: TAbstractFile): Promise<void> => {
		
			this._fileRecordMap.set(file.path, FileRecord.record(file, FileModificationType.DELETED));
			console.log("file deleted:", file);
	};
}

export class FileRecord {
	private _file: TAbstractFile;
	private _modType: FileModificationType = FileModificationType.CREATED;
	
	constructor(file: TAbstractFile, modType: FileModificationType) {
		this._file = file;
		this._modType = modType;
	}

	public static record(file: TAbstractFile, modType: FileModificationType): FileRecord {
		const record = new FileRecord(file, modType);
		return record;
	}

	// You can add methods or properties as needed
	toString(): string {
		return `${this._file.path}/${this._file.name} - modification: ${this._modType}`;
	}
}

export enum FileModificationType {
	CREATED = "created",
	UPDATED = "updated",
	DELETED = "deleted"	
}