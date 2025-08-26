import { FileModificationType } from './FileModificationType';
import { TAbstractFile } from 'obsidian';


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
