import { App, MarkdownView, Notice } from 'obsidian';
import { PromptFilenameModal } from './PromptFilenameModal';
import CustomSyncPlugin, { CustomSyncPluginSettings } from 'main';
import { StringHelper } from './StringHelper';

export class DrawIOCommandBuilder {

    public static createCommand(plugin: CustomSyncPlugin, app: App, settings: CustomSyncPluginSettings) : void {
        plugin.addCommand({
            id: "obs-plugin-drawio-create",
            name: "Insert drawio file",
            callback: async () => {

                // Check if the DrawIO template is set
                if (!settings._drawio_template || settings._drawio_template.trim() === "") {
                    new Notice("Please set a DrawIO template in the settings.");
                    return;
                }

                const folder = app.workspace.getActiveFile()?.parent;
                if (!folder) {
                    new Notice("No active folder to create DrawIO file in.");
                    return;
                }
                
                // ask user for filename
                new PromptFilenameModal(app, async (filename) => {
                    if (!filename) {
                        return;
                    }

                    const templateFile = plugin.ExpandTemplate();
                    const sourceFile = app.vault.getAbstractFileByPath(templateFile);
                    
                    if (!sourceFile) {
                        new Notice(`Template file not found: ${sourceFile}`);
                        return;
                    }

                    const targetFileName = await app.fileManager.getAvailablePathForAttachment(
                        StringHelper.AppendDrawioFileExtension(filename,templateFile));

                    console.log("Template file:", templateFile);
                    console.log("File path:", targetFileName);

                    const newDrawioFile = await app.vault.copy(sourceFile, targetFileName);

                    // insert link to new file
                    const linkText = `![[${newDrawioFile.path}]]`;
                    const editor = app.workspace.getActiveViewOfType(MarkdownView)?.editor;
                    if (editor) {
                        editor.replaceSelection(linkText);
                    } else {
                        new Notice("No active editor to insert link.");
                    }

                    // Optionally, open the new file if we are on desktop version
                    // @ts-ignore: isMobile is a global variable provided by Obsidian
                    // if (isMobile) {
                    //     new Notice("Opening the new DrawIO file is not supported on mobile.");
                    //     return;
                    // }

                    // todo: Open file in external default application
                    
                    // const adapter = app.vault.adapter;
                    // if (!(adapter instanceof FileSystemAdapter)) {
                    //     new Notice("This command only works with the FileSystemAdapter.");
                    //     return;
                    // }
                    // const vaultPath = adapter.getBasePath(); // This is safe after the cast
                    // const fullPath = path.join(vaultPath, newDrawioFile.path);

                    // app.workspace.openLinkText(fullPath, newDrawioFile.path, false);
                }).open();
            },
        });
    }

}