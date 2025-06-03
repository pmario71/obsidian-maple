import { App, Modal, Setting } from 'obsidian';
import { StringHelper } from './StringHelper';

export class PromptFilenameModal extends Modal {
	result = "";
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Filename for drawio file:" });

		new Setting(contentEl).setName("Input").addText((text) =>
			text.onChange(async (value) => {
				// add validation to ensure the filen does not yet exist
				const normalizedValue = StringHelper.NormalizePath(value);

				if (normalizedValue.length === 0) {
					text.setPlaceholder("Filename cannot be empty");
					return;
				}

				this.result = value;
			})
		);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(async () => {
					this.close();
					this.onSubmit(await this.getFilename(this.result));
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	async getFilename(fname: string): Promise<string> {
		const normalizedValue = StringHelper.NormalizePath(this.result);
		return await this.app.fileManager.getAvailablePathForAttachment(
			normalizedValue
		);
	}
}
