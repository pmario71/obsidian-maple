export class StringHelper {
    static NormalizePath(path: string): string {
        const x = path.replace(/\\/g, '/').replace(/\/+/g, '/').trim();
        return x.replace(/\s+/g, '-');
    }

    static ExtractDrawioFileExtension(path: string): string {

        const lastDotIndex =  path.lastIndexOf('.drawio');
        if (lastDotIndex === -1 || 
            lastDotIndex === path.length - 7) { // .drawio is 7 characters long
            return '';
        }
        return path.substring(lastDotIndex);
    }

    /**
     * Appends the Drawio file extension to the given file path.
     * If the extension is already present, it returns the original file path.
     * @param filePath The file path to which the extension should be appended.
     * @param extension The Drawio file extension to append (e.g., '.drawio.png').
     * @returns The file path with the Drawio extension appended.
     */
    static AppendDrawioFileExtension(filePath: string, extension: string): string {

        extension = this.ExtractDrawioFileExtension(extension);
        if (!extension) {
            return filePath; // No valid extension to append
        }

        // concat filePath with extension
        return filePath + extension; // Append extension with a dot
    }
}
