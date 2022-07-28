import { command } from "../../utils";
import type { commandConfigurations } from "../../utils/typings/types";

const TEXTS: {
	[l in "id" | "en"]: {
		[k in Uppercase<commandConfigurations["metadata"]["category"]>]: Function;
	};
} = {
	id: {
		BOTSETTINGS: () => "BOT 👾",
		GAMES: () => "PERMAINAN 🧩",
		GROUPTOOLS: () => "MANAJEMEN GRUP 👥",
		MEDIATOOLS: () => "ALAT MEDIA 🖼️",
		OTHERTOOLS: () => "PERALATAN LAINNYA ⚙️",
		OWNER: () => "PEMILIK BOT 😎",
		RANDOMFUN: () => "HIBURAN ACAK 🎲",
	},
	en: {
		BOTSETTINGS: () => "BOT 👾",
		GAMES: () => "GAMES 🧩",
		GROUPTOOLS: () => "GROUP MANAGEMENT 👥",
		MEDIATOOLS: () => "MEDIA TOOLS 🖼️",
		OTHERTOOLS: () => "OTHER TOOLS ⚙️",
		OWNER: () => "BOT OWNER 😎",
		RANDOMFUN: () => "RANDOM FUN 🎲",
	},
};

command.new({
	onCommand: async (context) => {
		const hits = context.userData().out.stats.hits;
		const isOwner = context.isBotOwner().out;
		const language = context.language().out;
		const categories: { [k: string]: commandConfigurations["metadata"][] } = {};
		for (const cmd of command.listOfCommands) {
			if (cmd.metadata.permission.includes("owner") && !isOwner) continue;
			categories[cmd.metadata.category] ??= [];
			categories[cmd.metadata.category].push(cmd.metadata);
		}
		let str = "*Miki Bot Commands List* 🍙";
		for (const category in categories) {
			str += "\n\n▓ *" + TEXTS[language][category.toUpperCase() as Uppercase<commandConfigurations["metadata"]["category"]>]() + "*\n┊";
			for (const metadata of categories[category]) {
				const names = metadata.command;
				const otherName = metadata.locale.name?.[language];
				const premium = metadata.premium;
				for (const [idx, name] of Object.entries(names)) {
					if (idx === "0") {
						str += "\n" + (hits[name] ? "┊" : "┃") + ` */${name}*` + (otherName ? ` » ${otherName}` : "") + (premium ? " $" : "");
					} else {
						str += "\n" + (hits[name] ? "┊" : "┃") + ` /${name}`;
					}
				}
			}
			str += "\n┊\n┗━━●────────────";
		}
		return context.reply({
			text: str,
		});
	},
	metadata: {
		__filename,
		command: ["menu"],
		permission: "all",
		category: "botsettings",
		locale: {
			description: {
				id: "[TODO] menu description",
				en: "[TODO] menu description",
			},
		},
	},
});
