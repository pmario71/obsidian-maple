import CustomSyncPlugin from 'main';
import { FileModificationType } from 'DataModel/FileModificationType';
import { FileRecord } from 'DataModel/FileRecord';
import { TFile, TAbstractFile } from 'obsidian';

/**
 * UpdateRecorder class is responsible for tracking file modifications
 * in the Obsidian vault, including file creation, updates, renames, and deletions.
 * It registers event listeners to capture these changes and maintains a record of them.
 */
export class UpdateRecorder {
	_plugin: CustomSyncPlugin;
	_fileRecordMap: Map<string, FileRecord> = new Map();

	constructor(private plugin: CustomSyncPlugin) {
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
