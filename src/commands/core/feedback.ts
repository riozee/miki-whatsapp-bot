import { command, basicTexts, btn } from "../../utils";

const TEXTS = {
	id: {
		NOARG: () => "Silahkan kirimkan pesan teks atau media yang ingin diteruskan ke developer Miki Bot...",
		DONE: () => "Pesan telah diteruskan. Terima kasih atas partisipasinya!",
	},
	en: {
		NOARG: () => "Please send a text or media message to be forwarded to developer of Miki Bot...",
		DONE: () => "Message has been forwarded. Thank you for your participation!",
	},
};

command.new({
	onCommand: async (context, bot) => {
		const language = context.language().out;
		const arg = context.arguments().out;
		const _dest = process.env.FEEDBACK_NUMBER || process.env.OWNER_NUMBER;
		const dest = _dest?.endsWith("@g.us") ? _dest : _dest + "@s.whatsapp.net";
		if (!arg) {
			const _context = await context.reply({ text: TEXTS[language].NOARG(), ...btn([basicTexts[language].CANCEL()]) }).waitInput().out;
			if (_context === "timeout" || _context.text().out?.toLowerCase() === basicTexts[language].CANCEL().toLowerCase()) {
				return context.reply({ text: basicTexts[language].CANCELED() });
			}
			await bot.sendMessage(dest, { forward: _context.update }, { quoted: _context.update });
			return _context.reply({ text: TEXTS[language].DONE() });
		} else {
			await bot.sendMessage(dest, { text: arg }, { quoted: context.update });
			return context.reply({ text: TEXTS[language].DONE() });
		}
	},
	metadata: {
		__filename,
		category: "botsettings",
		command: ["feedback"],
		permission: "all",
		locale: {
			description: {
				id: "[TODO] feedback description",
				en: "[TODO] feedback description",
			},
			name: {
				id: "umpan balik",
			},
		},
	},
});
