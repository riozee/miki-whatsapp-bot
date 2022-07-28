import { command } from "../../utils";

const TEXTS = {
	id: {
		CHAT_BANNED: (id: string) =>
			`*Chat ini telah di-ban oleh admin bot.*\n\nID Chat: ${id}\n\nHarap simpan ID Chat karena akan digunakan pada proses unban. Terima kasih.`,
		CHAT_UNBANNED: () => `Chat ini telah di-unban oleh admin bot. Terima kasih.`,
	},
	en: {
		CHAT_BANNED: (id: string) =>
			`*This chat has been banned by the bot admin.*\n\nChat ID: ${id}\n\nPlease save the Chat ID as it will be used in the unban process. Thank you.`,
		CHAT_UNBANNED: () => `This chat has been unbanned by the bot admin. Thank you.`,
	},
};

command.new({
	onCommand: async (context, bot) => {
		const lang = context.language().out;
		const arg = context.arguments().out;
		let id = arg;
		if (!id) id = context.chatId().out;
		const systemData = context.systemData().out;
		systemData.banneds ||= [];
		const idx = systemData.banneds.findIndex((v) => v === id);
		if (idx !== -1) {
			systemData.banneds.splice(idx, 1);
			const text = { text: TEXTS[lang].CHAT_UNBANNED() };
			context.reply(text);
			if (context.chatId().out !== id)
				bot.sendMessage(id, text, {
					ephemeralExpiration: 86400 * 7,
				}).catch(() => {});
		} else {
			systemData.banneds.push(id);
			const text = { text: TEXTS[lang].CHAT_BANNED(id) };
			context.reply(text);
			if (context.chatId().out !== id)
				bot.sendMessage(id, text, {
					ephemeralExpiration: 86400 * 7,
				}).catch(() => {});
		}
	},
	metadata: {
		__filename,
		command: ["ban"],
		permission: "all-owner",
		category: "owner",
		locale: {
			name: {
				id: "blokir",
			},
			description: {
				id: "[TODO] ban description",
				en: "[TODO] ban description",
			},
		},
	},
});
