import { command, requestArguments } from "../../utils";

const TEXTS = {
	id: {
		NAME: () => "Nama perintah",
		TITLE: (name: string) => `*Penjelasan Tentang Perintah "${name}"*`,
		NOT_FOUND: (name: string) => `Perintah "${name}" tidak ditemukan.\n\nGunakan perintah */menu* untuk melihat daftar perintah yang tersedia.`,
	},
	en: {
		NAME: () => "Command name",
		TITLE: (name: string) => `*Information About "${name}" Command*`,
		NOT_FOUND: (name: string) => `The "${name}" command was not found.\n\nUse */menu* command to see list of all commands.`,
	},
};

command.new({
	onCommand: async (context) => {
		const language = context.language().out;
		const [_arg] = await requestArguments(context, {
			arguments: [[TEXTS[language].NAME()]],
		});
		if (_arg === null) return;
		const arg = _arg.toLowerCase();
		const cmd = command.listOfCommands.find(({ metadata }) => metadata.command.includes(arg));
		if (!cmd) return context.reply({ text: TEXTS[language].NOT_FOUND(arg) });
		return context.reply({ text: TEXTS[language].TITLE(arg) + "\n\n" + cmd.metadata.locale.description[language] });
	},
	metadata: {
		__filename,
		command: ["help"],
		permission: "all",
		category: "botsettings",
		locale: {
			name: {
				id: "bantuan",
			},
			description: {
				id: "[TODO] help description",
				en: "[TODO] help description",
			},
		},
	},
});
