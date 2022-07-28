import { command, list, requestArguments } from "../../utils";

const LANGUAGES = {
	ID: "Bahasa Indonesia",
	EN: "English",
};

const TEXTS = {
	id: {
		NOARG: () => "Silahkan ketik nomor urut, kode bahasa atau nama bahasa dari daftar bahasa yang tersedia di bawah.",
		DONE: () => "Bahasa berhasil diganti ke Bahasa Indonesia.",
	},
	en: {
		NOARG: () => "Please write the number, language code, or language name from the list below:",
		DONE: () => "Language has been changed to English.",
	},
};

command.new({
	onCommand: async (context, bot) => {
		const language = context.language().out;
		const text =
			TEXTS[language].NOARG() +
			"\n\n" +
			Object.entries(LANGUAGES)
				.map((v, i) => `${i + 1}. *${v[0]}* » ${v[1]}`)
				.join("\n");
		const findLanguage = (x: string) => {
			if (isNaN(parseInt(x))) {
				const str = x.toUpperCase() as "ID" | "EN";
				if (LANGUAGES[str]) return str.toLowerCase();
				else
					return Object.entries(LANGUAGES)
						.find((x) => x[1].toUpperCase() === str)?.[0]
						?.toLowerCase();
			} else return Object.entries(LANGUAGES)[+x - 1]?.[0]?.toLowerCase();
		};
		const [arg] = await requestArguments(context, {
			arguments: [
				[
					"language",
					(x) => Boolean(findLanguage(x)),
					{
						onWrong: text,
						onMissing: text,
					},
				],
			],
			separator: (x) => [x],
		});
		if (arg === null) return;
		const lang = findLanguage(arg) as "id" | "en";
		if (context.isGroupChat().out) {
			context.chatData().out.language = lang;
		} else {
			context.userData().out.language = lang;
		}
		return context.reply({
			text: TEXTS[lang].DONE(),
		});
	},
	metadata: {
		__filename,
		command: ["language"],
		permission: "private-admin",
		category: "botsettings",
		locale: {
			description: {
				id: "[TODO] language description",
				en: "[TODO] language description",
			},
			name: {
				id: "bahasa",
			},
		},
	},
});
