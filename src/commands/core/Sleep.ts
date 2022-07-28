import { command } from "../../utils";

const TEXTS = {
	id: {
		SLEEP: () =>
			`zzzz... Miki sudah tidur.\n\nMiki akan berhenti menerima dan merespon ke pesan di grup ini.\n\nKamu bisa gunakan perintah */sleep* lagi untuk membangunkan Miki.`,
		WAKEUP: () =>
			`Ah! Miki sudah bangun.\n\nMiki akan mulai menerima dan merespon ke pesan di grup ini.\n\nKamu bisa gunakan perintah */sleep* lagi untuk menidurkan Miki.`,
	},
	en: {
		SLEEP: () =>
			`zzzz... Miki has fallen asleep.\n\nMiki will stop receiving and responding to messages in this group.\n\nYou can use the */sleep* command again to wake up Miki.`,
		WAKEUP: () =>
			`Ah! Miki has woken up.\n\nMiki will start receiving and responding to messages in this group.\n\nYou can use the */sleep* command again to let Miki sleep.`,
	},
};

command.new({
	onCommand: (context) => {
		const lang = context.language().out;
		const chatData = context.chatData().out;
		if (chatData.muted) {
			delete chatData.muted;
			context.reply({ text: TEXTS[lang].WAKEUP() });
		} else {
			chatData.muted = true;
			context.reply({ text: TEXTS[lang].SLEEP() });
		}
	},
	metadata: {
		__filename,
		command: ["sleep"],
		permission: "group-admin",
		category: "grouptools",
		locale: {
			name: {
				id: "tidur",
			},
			description: {
				id: "[TODO] sleep description",
				en: "[TODO] sleep description",
			},
		},
	},
});
