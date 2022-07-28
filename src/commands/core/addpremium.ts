import { command, requestArguments } from "../../utils";
import type * as Types from "../../utils/typings/types";

const TEXTS = {
	id: {
		SUCCESS: (days: number, untilDate: string, status: boolean) =>
			`Berhasil menambahkan ${days} hari ke premium.\n\nBerlaku hingga: ${untilDate}\nStatus premium: ${status ? "AKTIF" : "TIDAK AKTIF"}`,
	},
	en: {
		SUCCESS: (days: number, untilDate: string, status: boolean) =>
			`Added ${days} day${days === 1 ? "" : "s"} to premium.\n\nActive until: ${untilDate}\nPremium status: ${status ? "ACTIVE" : "INACTIVE"}`,
	},
};

let LOCALDB: Types.LOCALDB;
const wnet = "@s.whatsapp.net";

command.new({
	onStart: (DB) => (LOCALDB = DB),
	onCommand: async (context, bot) => {
		const lang = context.language().out;
		const [dur, num] = await requestArguments(context, {
			arguments: [
				["Duration", (x) => !isNaN(+x), { onWrong: "Duration is not a number." }],
				["Number", (x) => LOCALDB[x.replace(/\D+g/, "") + wnet]?.type === "user", { onWrong: "User not found." }],
			],
		});
		if (dur === null) return;
		const now = Date.now();
		const duration = parseInt(dur) * (24 * 60 * 60 * 1000);
		const number = num.replace(/\D+g/, "") + wnet;
		(LOCALDB[number] as Types.USERDB).premiumUntil = now + duration;
		const days = duration / (24 * 60 * 60 * 1000);
		context.reply({ text: `Added ${days} day(s) to ${number}` });
		bot.sendMessage(
			number,
			{ text: TEXTS[lang].SUCCESS(days, new Date(now + duration).toLocaleString(), now + duration > Date.now()) },
			{
				ephemeralExpiration: 86400 * 7,
			}
		);
	},
	metadata: {
		__filename,
		command: ["addpremium"],
		permission: "all-owner",
		category: "owner",
		locale: {
			description: {
				id: "[TODO] addpremium description",
				en: "[TODO] addpremium description",
			},
		},
	},
});
