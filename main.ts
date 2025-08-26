import { DrawIOCommandBuilder } from 'DrawioIntegation/DrawIOCommandBuilder';
import { App, FileSystemAdapter, normalizePath, Notice, Plugin, PluginSettingTab, Setting, TFile, Menu } from 'obsidian';
import { exec } from 'child_process';
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

    public ExpandTemplate(): string
    {
        // expand if relative path
        const template = this._settings._drawio_template ?? "template.drawio.svg";

        return (template && !path.isAbsolute(template)) ? path.join(this._pluginFolder, "templates", template) : template;
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

        // This adds a simple command that can be triggered anywhere
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

        // Add context menu entry for drawio files
        this.registerEvent(
            this.app.workspace.on('file-menu', (menu: Menu, file: TFile) => {
                if (!file) return;
                // Match *.drawio or *.drawio.*
                if (/\.drawio($|\.[^\\/]+$)/i.test(file.name)) {
                    menu.addItem((item) => {
                        item.setTitle('Open in DrawIO Desktop')
                            .setIcon('popup-open')
                            .onClick(() => {
                                const adapter = this.app.vault.adapter;
                                if (!(adapter instanceof FileSystemAdapter)) {
                                    new Notice('This command only works with the FileSystemAdapter.');
                                    return;
                                }
                                const vaultPath = adapter.getBasePath();
                                const fullPath = path.join(vaultPath, normalizePath(file.path));

                                const drawioPath = this._settings._drawio_executable;

                                // If drawioPath is set, use it; otherwise, use system default
                                if (drawioPath && drawioPath.trim() !== "") {
                                    exec(`"${drawioPath}" "${fullPath}"`, (err) => {
                                        if (err) {
                                            new Notice('Failed to open in DrawIO Desktop: ' + err.message);
                                        }
                                    });
                                } else {
                                    exec(`start "" "${fullPath}"`, (err) => {
                                        if (err) {
                                            new Notice('Failed to open in DrawIO Desktop: ' + err.message);
                                        }
                                    });
                                }
                            });
                    });
                }
            })
        );
        
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

        new Setting(containerEl)
            .setName("DrawIO template file")
            .setDesc(
                "Path to the DrawIO template file used for new diagrams. If not set, the default template will be used."
            )
            .addText((text) =>
                text
                    .setPlaceholder("template.drawio.svg")
                    .setValue(this._settings._drawio_template || "")
                    .onChange(async (value) => {
                        this._settings._drawio_template = value;
                        await this.plugin.saveSettings();
                    })
            );

        const drawioFiles = this.app.vault.getFiles().filter(f => /\.drawio($|\.[^\\/]+$)/i.test(f.name));

        new Setting(containerEl).setName("Dropdown")
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