import { command } from "../utils";

const TEXTS = {
	id: {
		NONE: () => "Kamu belum menggunakan perintah apapun.",
	},
	en: {
		NONE: () => "You have not used any command.",
	},
};

command.new({
	onCommand: (context) => {
		const hits = Object.entries(context.userData().out.stats.hits);
		if (!hits.length) return context.reply({ text: TEXTS[context.language().out].NONE() });
		return context.reply({
			text: hits
				.sort((a, b) => b[1] - a[1])
				.map((v, i) => `${i + 1}. */${v[0]}* » ${v[1]}×`)
				.join("\n"),
		});
	},
	metadata: {
		__filename,
		category: "botsettings",
		command: ["stats"],
		permission: "all",
		locale: {
			description: {
				id: "[TODO] stats description",
				en: "[TODO] stats description",
			},
			name: {
				id: "statistik",
			},
		},
	},
});
