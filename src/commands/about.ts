import { command, tbtn } from "../utils";

command.new({
	onCommand: (context) => {
		const ums = process.uptime() * 1000;
		const f = Math.floor;
		context.reply({
			text: `\n\n*Miki Bot* 🍙\n\nUptime: *${f(ums / 3_600_000)}:${f((ums / 60000) % 60)}:${f((ums / 1000) % 60)}.${f(ums % 1000)}*\n\n`,
			...tbtn([{ url: "https://github.com/riozec/miki-whatsapp-bot", text: "GitHub" }], "(c) Rioze"),
		});
	},
	metadata: {
		__filename,
		category: "botsettings",
		command: ["about"],
		permission: "all",
		locale: {
			description: {
				id: "[TODO] about description",
				en: "[TODO] about description",
			},
			name: {
				id: "tentang",
			},
		},
	},
});
