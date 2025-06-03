import { StringHelper } from './StringHelper';

describe('StringHelper', () => {
    describe('NormalizePath', () => {
        it('should replace backslashes with forward slashes', () => {
            expect(StringHelper.NormalizePath('folder\\subfolder\\file.txt')).toBe('folder/subfolder/file.txt');
        });

        it('should collapse multiple forward slashes into one', () => {
            expect(StringHelper.NormalizePath('folder//subfolder///file.txt')).toBe('folder/subfolder/file.txt');
        });

        it('should handle mixed slashes and collapse them', () => {
            expect(StringHelper.NormalizePath('folder\\/subfolder\\\\//file.txt')).toBe('folder/subfolder/file.txt');
        });

        it('should trim whitespace from the result', () => {
            expect(StringHelper.NormalizePath('  folder\\subfolder\\file.txt  ')).toBe('folder/subfolder/file.txt');
        });

        it('should handle empty string', () => {
            expect(StringHelper.NormalizePath('')).toBe('');
        });

        it('should handle string with only slashes', () => {
            expect(StringHelper.NormalizePath('/////')).toBe('/');
        });

        it('should replace whitespace with -', () => {
            expect(StringHelper.NormalizePath('test filename')).toBe('test-filename');
        });
    });

    describe('ExtractDrawioFileExtension', () => {
        it('should return extension for png', () => {
            expect(StringHelper.ExtractDrawioFileExtension('testfile.drawio.png')).toBe('.drawio.png');
        });

        it('should return extension for png', () => {
            expect(StringHelper.ExtractDrawioFileExtension('testfile.drawio.svg')).toBe('.drawio.svg');
        });

        it('should return empty string for no extension', () => {
            expect(StringHelper.ExtractDrawioFileExtension('testfile')).toBe('');
        });

        it('should return empty string for wrong extension', () => {
            expect(StringHelper.ExtractDrawioFileExtension('testfile.drawio')).toBe('');
        });
    });

    describe('AppendDrawioFileExtension', () => {
        it('should return extension for png', () => {
            expect(StringHelper.AppendDrawioFileExtension('', 'testfile.drawio.png')).toBe('.drawio.png');
        });

        it('should return extension for png', () => {
            expect(StringHelper.AppendDrawioFileExtension('test', '.drawio.png')).toBe('test.drawio.png');
        });

        it('should return extension for svg', () => {
            expect(StringHelper.AppendDrawioFileExtension('test', '.drawio.svg')).toBe('test.drawio.svg');
        });
    });

});