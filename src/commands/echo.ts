import { command, requestArguments } from "../utils";

const TEXTS = {
	id: {
		TEXT: () => "Teks",
	},
	en: {
		TEXT: () => "Text",
	},
};

command.new({
	onCommand: async (context) => {
		const [arg] = await requestArguments(context, {
			arguments: [[TEXTS[context.language().out].TEXT()]],
			customInput: context.arguments().out || context.quotedText().out,
			separator: (v) => [v],
		});
		if (arg === null) return;
		return context.reply({ text: arg });
	},
	metadata: {
		__filename,
		command: ["echo", "say"],
		permission: "all",
		category: "othertools",
		locale: {
			name: {
				id: "katakan",
			},
			description: {
				id: "[TODO] echo description",
				en: "[TODO] echo description",
			},
		},
	},
});
