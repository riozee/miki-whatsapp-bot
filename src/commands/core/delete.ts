import { command, requestMessage } from "../../utils";

const TEXTS = {
	id: {
		NOTFROMME: () => "Miki hanya dapat menghapus pesan Miki sendiri.",
		NOMSG: () => "Silahkan balas ke pesan yang dikirim Miki biar Miki hapus.",
	},
	en: {
		NOTFROMME: () => "Miki cannot delete other people's message.",
		NOMSG: () => "Please reply to the message Miki sent. Miki will delete it ASAP.",
	},
};

command.new({
	onCommand: async (context, bot) => {
		const botNumber = process.env.BOT_NUMBER + "@s.whatsapp.net";
		if (context.quotedUserId().out) {
			if (context.quotedUserId().out !== botNumber) return context.reply({ text: TEXTS[context.language().out].NOTFROMME() });
		} else {
			const [messageContext] = await requestMessage(context, {
				messages: [
					[
						"",
						(c) => c.quotedUserId().out === botNumber,
						{
							onMissing: TEXTS[context.language().out].NOMSG(),
							onWrong: TEXTS[context.language().out].NOTFROMME() + "\n\n" + TEXTS[context.language().out].NOMSG(),
						},
					],
				],
			});
			if (messageContext === null) return;
			context = messageContext;
		}

		const content = context.msgContent().out!;
		if (/*always true*/ typeof content !== "string" && "contextInfo" in content) {
			return bot.sendMessage(context.chatId().out, {
				delete: {
					remoteJid: context.chatId().out,
					fromMe: true,
					participant: botNumber,
					id: content.contextInfo!.stanzaId,
				},
			});
		}
	},
	metadata: {
		__filename,
		category: "botsettings",
		command: ["delete", "del"],
		permission: "all",
		locale: {
			description: {
				id: "[TODO] delete description",
				en: "[TODO] delete description",
			},
			name: {
				id: "hapus pesan",
			},
		},
	},
});
