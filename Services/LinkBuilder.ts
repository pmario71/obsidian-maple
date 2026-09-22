/**
 * Helper utilities for generating Obsidian deep links and parsing headings.
 */
export class LinkBuilder {
	/**
	 * Extracts heading text if a line is a markdown heading (# ... through ###### ...).
	 * Returns null if the line is not a heading.
	 */
	public static extractHeading(lineText: string): string | null {
		if (!lineText) {
			return null;
		}

		const match = lineText.match(/^#{1,6}\s+(.+)$/);
		if (!match) {
			return null;
		}

		let heading = match[1].trim();
		// Strip trailing # if closing header syntax (e.g. "## Heading ##")
		heading = heading.replace(/\s*#+\s*$/, '').trim();

		return heading.length > 0 ? heading : null;
	}

	/**
	 * Strips .md extension from a file path if present.
	 */
	public static normalizeFilePathForLink(filePath: string): string {
		if (filePath.toLowerCase().endsWith('.md')) {
			return filePath.slice(0, -3);
		}
		return filePath;
	}

	/**
	 * Formats an obsidian://open deep link.
	 *
	 * Example:
	 * vault = "MyVault", path = "Projects/Architecture.md" -> "obsidian://open?vault=MyVault&file=Projects%2FArchitecture" or preserving "/" as "Projects/Architecture"
	 * with heading "Design Decisions" -> "obsidian://open?vault=MyVault&file=Projects/Architecture%23Design%20Decisions"
	 */
	public static formatObsidianUrl(vaultName: string, filePath: string, heading?: string | null): string {
		const cleanPath = this.normalizeFilePathForLink(filePath);

		// Encode path segments preserving forward slash separators
		const encodedPath = cleanPath
			.split('/')
			.map(segment => encodeURIComponent(segment))
			.join('/');

		let fileParam = encodedPath;

		if (heading) {
			const cleanHeading = heading.replace(/^#{1,6}\s*/, '').trim();
			if (cleanHeading.length > 0) {
				fileParam += '%23' + encodeURIComponent(cleanHeading);
			}
		}

		const encodedVault = encodeURIComponent(vaultName);

		return `obsidian://open?vault=${encodedVault}&file=${fileParam}`;
	}
}
