import { LinkBuilder } from './LinkBuilder';

describe('LinkBuilder', () => {
	describe('extractHeading', () => {
		test('should extract H1 heading text', () => {
			expect(LinkBuilder.extractHeading('# Architecture Overview')).toBe('Architecture Overview');
		});

		test('should extract H2 to H6 headings', () => {
			expect(LinkBuilder.extractHeading('## Design Decisions')).toBe('Design Decisions');
			expect(LinkBuilder.extractHeading('### Component Model')).toBe('Component Model');
			expect(LinkBuilder.extractHeading('###### Deep Heading')).toBe('Deep Heading');
		});

		test('should strip closing hashes in closed header syntax', () => {
			expect(LinkBuilder.extractHeading('## Section Title ##')).toBe('Section Title');
		});

		test('should return null for non-heading plain text', () => {
			expect(LinkBuilder.extractHeading('This is normal text with #notAHeading.')).toBeNull();
			expect(LinkBuilder.extractHeading('   # Indented text')).toBeNull();
			expect(LinkBuilder.extractHeading('')).toBeNull();
		});

		test('should return null for hash without trailing space', () => {
			expect(LinkBuilder.extractHeading('#NotAHeading')).toBeNull();
			expect(LinkBuilder.extractHeading('###')).toBeNull();
		});
	});

	describe('normalizeFilePathForLink', () => {
		test('should strip .md extension case-insensitively', () => {
			expect(LinkBuilder.normalizeFilePathForLink('Projects/Architecture.md')).toBe('Projects/Architecture');
			expect(LinkBuilder.normalizeFilePathForLink('Projects/Architecture.MD')).toBe('Projects/Architecture');
		});

		test('should keep non-md paths intact', () => {
			expect(LinkBuilder.normalizeFilePathForLink('Projects/Architecture')).toBe('Projects/Architecture');
			expect(LinkBuilder.normalizeFilePathForLink('Drawings/diagram.drawio.svg')).toBe('Drawings/diagram.drawio.svg');
		});
	});

	describe('formatObsidianUrl', () => {
		test('should format note-level deep link', () => {
			const url = LinkBuilder.formatObsidianUrl('MyVault', 'Projects/Architecture.md');
			expect(url).toBe('obsidian://open?vault=MyVault&file=Projects/Architecture');
		});

		test('should format deep link with spaces in vault and file name', () => {
			const url = LinkBuilder.formatObsidianUrl('My Knowledge Base', 'Azure & Cloud/Express Route.md');
			expect(url).toBe('obsidian://open?vault=My%20Knowledge%20Base&file=Azure%20%26%20Cloud/Express%20Route');
		});

		test('should format deep link with heading anchor', () => {
			const url = LinkBuilder.formatObsidianUrl('MyVault', 'Projects/Architecture.md', 'Design Decisions');
			expect(url).toBe('obsidian://open?vault=MyVault&file=Projects/Architecture%23Design%20Decisions');
		});

		test('should format deep link with leading hash in heading parameter', () => {
			const url = LinkBuilder.formatObsidianUrl('KnowledgeBase', 'Azure/Networking.md', '## ExpressRoute');
			expect(url).toBe('obsidian://open?vault=KnowledgeBase&file=Azure/Networking%23ExpressRoute');
		});

		test('should handle root-level files', () => {
			const url = LinkBuilder.formatObsidianUrl('Vault', 'Readme.md');
			expect(url).toBe('obsidian://open?vault=Vault&file=Readme');
		});
	});
});
