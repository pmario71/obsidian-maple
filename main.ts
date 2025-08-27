import { DrawIOCommandBuilder } from 'DrawioIntegation/DrawIOCommandBuilder';
import { isRenderedDrawioFile } from 'DrawioIntegation/FileExt';
import { App, FileSystemAdapter, normalizePath, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

import path from 'path';
import { UpdateRecorder } from 'Services/UpdateRecorder';


// Remember to rename these classes and interfaces!

export interface CustomSyncPluginSettings {
    _syncServerUrl_azure?: string; // Azure sync server URL
    _azureToken: string;

    _syncServerUrl_local?: string; // local sync server URL

    _drawio_template?: string; // Path to the DrawIO template file

    _drawio_executable?: string; // Path to the DrawIO (diagrams.net) desktop application executable
}

const DEFAULT_SETTINGS: CustomSyncPluginSettings = {
    _azureToken: 'default',
    _drawio_executable: "C:\\Program Files\\draw.io\\draw.io.exe"
}

export default class CustomSyncPlugin extends Plugin {
    private _settings: CustomSyncPluginSettings;
    private _updateRecorder: UpdateRecorder;

    private _vaultPath: string;
    private _pluginFolder: string;

    // Get configuration settings
    public get Settings(): CustomSyncPluginSettings {
        return this._settings;
    }

    public get TemplateFolder(): string {
        let folder = this.app.vault.getFolderByPath( "zz Templates");
        if (!folder) {
            folder = this.app.vault.getFolderByPath( "Templates");
        }
        return folder?.path || "";
    }

    // todo: can be removed
    public ExpandTemplate(): string
    {
        // expand if relative path
        const template = this._settings._drawio_template ?? "Templates/template.drawio.svg";
        return template;
    }

    async onload() {

        const adapter = this.app.vault.adapter;
        if (!(adapter instanceof FileSystemAdapter)) {
            new Notice("This command only works with the FileSystemAdapter.");
            return;
        }
        this._vaultPath = adapter.getBasePath(); // This is safe after the cast
        this._pluginFolder = this._vaultPath + '/.obsidian/plugins/' + this.manifest.id;

        await this.loadSettings();

        // ===========================================================================================
        this.addCommand({
            id: "obs-plugin-dump",
            name: "Dump file records",
            callback: () => {
                // new SampleModal(this.app).open();
                this._updateRecorder.dumpRecords();
            },
        });

        // ===========================================================================================
        this.addCommand({
            id: "obs-plugin-filepath-to-clipboard",
            name: "Copy full file path to clipboard",
            callback: () => {
                // const folder = this.app.vault.adapter.getResourcePath() || "<n.a.>";
                        
                const activeFile = this.app.workspace.getActiveFile();
                if (!activeFile) {
                    new Notice("No active file to copy path from.");
                    return;
                }
                const fullPath = path.join(this._vaultPath, normalizePath(activeFile.path));

                navigator.clipboard.writeText(fullPath).then(() => {
                    new Notice(`Copied: ${fullPath}`);
                }).catch(err => {
                    new Notice(`Failed to copy: ${err}`);
                });
            },
        });
        
        // ===========================================================================================
        DrawIOCommandBuilder.createCommand(this, this.app, this._settings);

        // ===========================================================================================
        this._updateRecorder = new UpdateRecorder(this);
        this._updateRecorder.RegisterEvents();
        

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SampleSettingTab(this.app, this, this._settings));
    }

    onunload() {}

    async loadSettings() {
        this._settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this._settings);
    }
}

class SampleSettingTab extends PluginSettingTab {
    plugin: CustomSyncPlugin;
    private _settings: CustomSyncPluginSettings;

    constructor(app: App, plugin: CustomSyncPlugin, settings: CustomSyncPluginSettings) {
        super(app, plugin);
        this.plugin = plugin;
        this._settings = settings;	
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Token for Azure Blob Storage")
            .setDesc("It's a secret")
            .addText((text) =>
                text
                    .setPlaceholder("Enter token")
                    .setValue(this._settings._azureToken)
                    .onChange(async (value) => {
                        this._settings._azureToken = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Local Sync Server URL")
            .setDesc(
                "URL to local sync server, which is initially contacted before falling back to Azure"
            )
            .addText((text) =>
                text
                    .setPlaceholder("Enter a value for setting #2")
                    .setValue(this._settings._syncServerUrl_local || "")
                    .onChange(async (value) => {
                        this._settings._syncServerUrl_local = value;
                        await this.plugin.saveSettings();
                    })
            );

        const templatePath = this.plugin.TemplateFolder.toLowerCase();
        const drawioFiles = this.app.vault.getFiles()
                                .filter(f => f.path.toLowerCase().contains(templatePath))
                                .filter(f => isRenderedDrawioFile(f));

        if (drawioFiles.length === 0) {
            const fileExample = this.app.vault.getFiles().first()?.path || "n.a.";
            new Notice("No drawio template files found in the /(zz )Templates folder. Please add at least one .drawio.svg|png file: " + fileExample);
            return;
        }
        // automatically set if only a single file exists (to avoid that the template cannot be set because the onChange() event does not fire.)
        if (drawioFiles.length == 1) {
            this._settings._drawio_template = drawioFiles[0].path;
            
            this.plugin.saveSettings().catch(err => {
                console.error("Failed to save settings:", err);
            });
        }

        new Setting(containerEl)
            .setName("DrawIO template file")
            .setDesc(
                "Path to the DrawIO template file used for new diagrams (Typically under '/Templates/*.drawio.svg/png'). If not set, creating new drawio files will not work!"
            )
            .addDropdown((dropdown) =>
            {
                dropdown.setValue(this._settings._drawio_template || "");

                drawioFiles.forEach(file => {
                    dropdown.addOption(file.path, file.path);
                });

                dropdown.onChange(async (value) => {
                    this._settings._drawio_template = value;
                    await this.plugin.saveSettings();
                })
            });

        new Setting(containerEl)
            .setName("Path of DrawIO executable")
            .setDesc(
                "Path to the DrawIO (diagrams.net) desktop application executable. If not set, the system default application for .drawio files will be used."
            )
            .addText((text) =>
                text
                    .setPlaceholder("C:\\Program Files\\draw.io\\draw.io.exe")
                    .setValue(this._settings['_drawio_executable'] || "")
                    .onChange(async (value) => {
                        this._settings['_drawio_executable'] = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}