import { App, Editor, MarkdownView, Menu, Notice, TAbstractFile, TFile } from 'obsidian';
import { LinkBuilder } from './LinkBuilder';
import CustomSyncPlugin from 'main';

export class LinkCommandBuilder {
	private static readonly menuTitle = 'Get link';

	public static register(plugin: CustomSyncPlugin, app: App): void {
		// ===========================================================================================
		// Context menu in Editor (distinguishes heading vs plain text)
		plugin.registerEvent(
			app.workspace.on('editor-menu', (menu: Menu, editor: Editor, view: MarkdownView) => {
				const file = view.file;
				if (!file || file.extension !== 'md') {
					return;
				}

				const cursor = editor.getCursor();
				const lineText = editor.getLine(cursor.line);
				const heading = LinkBuilder.extractHeading(lineText);
				const vaultName = app.vault.getName();
				const url = LinkBuilder.formatObsidianUrl(vaultName, file.path, heading);

				menu.addItem((item) => {
					item.setTitle(LinkCommandBuilder.menuTitle)
						.setIcon('link')
						.onClick(async () => {
							try {
								await navigator.clipboard.writeText(url);
								new Notice(`Link copied to clipboard: ${url}`);
							} catch (err) {
								new Notice(`Failed to copy link: ${err}`);
							}
						});
				});
			})
		);

		// ===========================================================================================
		// Context menu in File Explorer (note-level link)
		plugin.registerEvent(
			app.workspace.on('file-menu', (menu: Menu, file: TAbstractFile) => {
				if (!(file instanceof TFile) || file.extension !== 'md') {
					return;
				}

				const vaultName = app.vault.getName();
				const url = LinkBuilder.formatObsidianUrl(vaultName, file.path);

				menu.addItem((item) => {
					item.setTitle(LinkCommandBuilder.menuTitle)
						.setIcon('link')
						.onClick(async () => {
							try {
								await navigator.clipboard.writeText(url);
								new Notice(`Link copied to clipboard: ${url}`);
							} catch (err) {
								new Notice(`Failed to copy link: ${err}`);
							}
						});
				});
			})
		);

		// ===========================================================================================
		// Command palette command
		plugin.addCommand({
			id: 'obs-plugin-get-link',
			name: 'Get link for current note / heading',
			editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
				const file = view.file;
				if (!file || file.extension !== 'md') {
					return false;
				}

				if (!checking) {
					const cursor = editor.getCursor();
					const lineText = editor.getLine(cursor.line);
					const heading = LinkBuilder.extractHeading(lineText);
					const vaultName = app.vault.getName();
					const url = LinkBuilder.formatObsidianUrl(vaultName, file.path, heading);

					navigator.clipboard.writeText(url).then(() => {
						new Notice(`Link copied to clipboard: ${url}`);
					}).catch(err => {
						new Notice(`Failed to copy link: ${err}`);
					});
				}

				return true;
			},
		});
	}
}
