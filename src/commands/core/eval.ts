import * as utils from "../../utils";
import { format } from "util";
import type * as Types from "../../utils/typings/types";

let LOCALDB: Types.LOCALDB;

utils.command.new({
	onStart: (DB) => (LOCALDB = DB),
	onCommand: async (context, bot) => {
		try {
			const [arg] = await utils.requestArguments(context, {
				arguments: [["Script"]],
				customInput: context.arguments().out || context.quotedText().out,
				separator: (v) => [v],
			});
			if (arg === null) return;
			return context.reply({ text: format(await eval(arg)) });
		} catch (error) {
			return context.react("😕").reply({ text: String(error) });
		}
	},
	metadata: {
		__filename,
		command: ["ev"],
		permission: "all-owner",
		category: "owner",
		locale: {
			description: {
				id: "[TODO] ev description",
				en: "[TODO] ev description",
			},
		},
	},
});
