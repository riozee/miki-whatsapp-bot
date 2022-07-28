import { command } from "../../utils";

const TEXTS = {
	id: {
		ON: () => "Sekarang hanya admin grup yang dapat menggunakan Miki.",
		OFF: () => "Sekarang semua anggota grup dapat menggunakan Miki.",
	},
	en: {
		ON: () => "Only admins can use Miki now.",
		OFF: () => "All members can use Miki now.",
	},
};

command.new({
	onCommand: (context) => {
		const language = context.language().out;
		const chatData = context.chatData().out;
		if (chatData.adminonly) {
			delete chatData.adminonly;
			return context.reply({ text: TEXTS[language].OFF() });
		} else {
			chatData.adminonly = true;
			return context.reply({ text: TEXTS[language].ON() });
		}
	},
	metadata: {
		__filename,
		command: ["adminonly"],
		permission: "group-admin",
		category: "botsettings",
		locale: {
			description: {
				id: "[TODO] adminonly description",
				en: "[TODO] adminonly description",
			},
			name: {
				id: "hanya admin",
			},
		},
	},
});
