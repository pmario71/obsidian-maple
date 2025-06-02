import { describe, it, expect } from '@jest/globals';


// Import FileRecord and FileModificationType from main.ts
// import '../main'; // Ensures main.ts is loaded for type augmentation if needed
import { FileModificationType } from 'DataModel/FileModificationType';
import { FileRecord } from 'DataModel/FileRecord';
import { TAbstractFile } from 'obsidian';


describe('FileRecord', () => {
    
    const mockFile = (path: string, name: string): TAbstractFile => ({
        path,
        name,
        // The rest of TAbstractFile is not needed for these tests
    } as TAbstractFile);

    it('should construct with correct file and modification type', () => {
        const file = mockFile('folder/file.md', 'file.md');
        const record = new FileRecord(file, FileModificationType.CREATED);
        expect(record.toString()).toBe('folder/file.md/file.md - modification: created');
    });

    it('should use static record method correctly', () => {
        const file = mockFile('folder/another.md', 'another.md');
        const record = FileRecord.record(file, FileModificationType.UPDATED);
        expect(record.toString()).toBe('folder/another.md/another.md - modification: updated');
    });

    it('should handle DELETED modification type', () => {
        const file = mockFile('deleted/file.md', 'file.md');
        const record = FileRecord.record(file, FileModificationType.DELETED);
        expect(record.toString()).toBe('deleted/file.md/file.md - modification: deleted');
    });
});