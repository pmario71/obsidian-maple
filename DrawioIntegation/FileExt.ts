
import { TFile } from "obsidian";

/**
 * Determines whether the given file is a Drawio export file.
 *
 * Checks if the file name ends with either `.drawio.png` or `.drawio.svg`,
 * which are common extensions for Drawio exported images.
 *
 * @param file - The file to check, represented as a `TFile` object.
 * @returns `true` if the file is a Drawio export image, otherwise `false`.
 */
export function isRenderedDrawioFile(file: TFile): boolean {
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.drawio.png') || 
        lowerName.endsWith('.drawio.svg')) {
        return true;
    }
    return false;
}


export function isDrawioFile(file: TFile): boolean {
        const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.drawio.png') || 
        lowerName.endsWith('.drawio.svg') ||
        lowerName.endsWith('.drawio')) {
        return true;
    }
    return false;
}