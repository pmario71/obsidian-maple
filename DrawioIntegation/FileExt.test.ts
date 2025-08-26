import { describe, it, expect } from '@jest/globals';
import { isRenderedDrawioFile, isDrawioFile } from './FileExt';
import { TFile } from 'obsidian';

function mockTFile(name: string): TFile {
    return { name } as TFile;
}

describe('isRenderedDrawioFile', () => {
    it('returns true for .drawio.png files', () => {
        expect(isRenderedDrawioFile(mockTFile('diagram.drawio.png'))).toBe(true);
        expect(isRenderedDrawioFile(mockTFile('myfile.drawio.png'))).toBe(true);
    });

    it('returns true for .drawio.svg files', () => {
        expect(isRenderedDrawioFile(mockTFile('diagram.drawio.svg'))).toBe(true);
        expect(isRenderedDrawioFile(mockTFile('myfile.drawio.svg'))).toBe(true);
    });

    it('returns false for .png files not exported from Drawio', () => {
        expect(isRenderedDrawioFile(mockTFile('image.png'))).toBe(false);
        expect(isRenderedDrawioFile(mockTFile('diagram.png'))).toBe(false);
    });

    it('returns false for .svg files not exported from Drawio', () => {
        expect(isRenderedDrawioFile(mockTFile('vector.svg'))).toBe(false);
        expect(isRenderedDrawioFile(mockTFile('diagram.svg'))).toBe(false);
    });

    it('is case-insensitive for extensions', () => {
        expect(isRenderedDrawioFile(mockTFile('diagram.DRAWIO.PNG'))).toBe(true);
        expect(isRenderedDrawioFile(mockTFile('diagram.DRAWIO.SVG'))).toBe(true);
    });

    it('returns false for other extensions', () => {
        expect(isRenderedDrawioFile(mockTFile('diagram.drawio.jpg'))).toBe(false);
        expect(isRenderedDrawioFile(mockTFile('diagram.drawio.pdf'))).toBe(false);
        expect(isRenderedDrawioFile(mockTFile('diagram.drawio'))).toBe(false);
    });

    it('returns false for empty file name', () => {
        expect(isRenderedDrawioFile(mockTFile(''))).toBe(false);
    });

    it('returns false for file name with only extension', () => {
        expect(isRenderedDrawioFile(mockTFile('.drawio.png'))).toBe(true);
        expect(isRenderedDrawioFile(mockTFile('.drawio.svg'))).toBe(true);
        expect(isRenderedDrawioFile(mockTFile('.png'))).toBe(false);
        expect(isRenderedDrawioFile(mockTFile('.svg'))).toBe(false);
    });

    it('returns true for file names with multiple dots', () => {
        expect(isRenderedDrawioFile(mockTFile('a.b.c.drawio.png'))).toBe(true);
        expect(isRenderedDrawioFile(mockTFile('a.b.c.drawio.svg'))).toBe(true);
    });
});

describe('isDrawioFile', () => {
    it('returns true for files ending with .drawio', () => {
        expect(isDrawioFile(mockTFile('diagram.drawio'))).toBe(true);
        expect(isDrawioFile(mockTFile('myfile.drawio'))).toBe(true);
    });

    it('returns true for files ending with .drawio and another extension', () => {
        expect(isDrawioFile(mockTFile('diagram.drawio.png'))).toBe(true);
        expect(isDrawioFile(mockTFile('diagram.drawio.svg'))).toBe(true);
        expect(isDrawioFile(mockTFile('diagram.drawio.pdf'))).toBe(false);
        expect(isDrawioFile(mockTFile('diagram.drawio.txt'))).toBe(false);
    });

    it('returns true for files with multiple dots before .drawio', () => {
        expect(isDrawioFile(mockTFile('a.b.c.drawio'))).toBe(true);
        expect(isDrawioFile(mockTFile('a.b.c.drawio.png'))).toBe(true);
    });

    it('is case-insensitive for .drawio extension', () => {
        expect(isDrawioFile(mockTFile('diagram.DRAWIO'))).toBe(true);
        expect(isDrawioFile(mockTFile('diagram.DRAWIO.PNG'))).toBe(true);
    });

    it('returns false for files not ending with .drawio or .drawio.<ext>', () => {
        expect(isDrawioFile(mockTFile('diagram.png'))).toBe(false);
        expect(isDrawioFile(mockTFile('diagram.svg'))).toBe(false);
        expect(isDrawioFile(mockTFile('diagram.drawio2'))).toBe(false);
        expect(isDrawioFile(mockTFile('diagram.drawiopng'))).toBe(false);
    });

    it('returns false for empty file name', () => {
        expect(isDrawioFile(mockTFile(''))).toBe(false);
    });

    it('returns true for file name with only extension', () => {
        expect(isDrawioFile(mockTFile('.drawio'))).toBe(true);
        expect(isDrawioFile(mockTFile('.drawio.png'))).toBe(true);
    });

    it('returns false for file name with similar but not exact extension', () => {
        expect(isDrawioFile(mockTFile('diagram.drawioo'))).toBe(false);
        expect(isDrawioFile(mockTFile('diagram.drawio2.png'))).toBe(false);
    });
});