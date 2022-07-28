import type * as Types from "./typings/types";

export const command = new (class Commands {
	listOfCommands: Types.commandConfigurations[] = [];

	new(configurations: Types.commandConfigurations) {
		// if there is a command having the same file name, you want it to update the existing one, not adding and duplicated it.
		const index = this.listOfCommands.findIndex(({ metadata }) => metadata.__filename === configurations.metadata.__filename);
		if (index !== -1) {
			this.listOfCommands.splice(index, 1, configurations);
		} else {
			this.listOfCommands.push(configurations);
		}
	}
})();

export const basicTexts = {
	id: {
		CMD_NOT_FOUND: () =>
			"Maaf, Miki gak bisa mengenali perintah tersebut.\n\nBeritahu Miki menggunakan perintah */feedback* jika kamu ingin fitur tersebut ditambahkan. Miki akan memberitahukannya pada sang owner!",
		INT_NOT_FOUND: () => "Maaf, Miki gak bisa memahami tulisanmu.\n\nAjarin miki dengan menggunakan perintah */feedback*, yuk!",
		NOT_OWNER: () => "Cuma sang owner yang bisa kasih perintah ini ke Miki.",
		NOT_ADMIN: () => "Cuma sang admin grup yang bisa kasih perintah ini ke Miki.",
		NOT_GROUP: () => "Kamu harus berada di dalam grup untuk dapat memberikan perintah ini ke Miki.",
		NOT_PRIVATE: () => "Kamu harus berada di chat pribadi untuk dapat memberikan perintah ini ke Miki.",
		NOT_PREMIUM: () => "Perintah ini khusus untuk member Premium. Kamu harus menjadi member Premium untuk menggunakan perintah ini.",
		NOT_PRIVATE_ADMIN: () => "Perintah ini hanya bisa dijalankan di chat pribadi atau admin grup jika di dalam grup.",
		SPAM: (s: number) => `Harap beri jeda selama ${s} detik sebelum memulai perintah baru.`,
		FIRSTTIME_CMD_DESC: (cmd: string, desc: string, prem: boolean) =>
			`*Pengenalan Perintah _/${cmd}_*\n\n${
				prem ? `_Perintah ini adalah perintah Premium._\n\n` : ""
			}${desc}\n\nKamu bisa melihat pesan bantuan ini lagi dengan perintah:\n*/help (spasi) nama perintah*`,
		CANCELED: () => `Operasi dibatalkan.`,
		CANCEL: () => "Batal",
		PREMIUM_LIMIT: (time: string) =>
			`Kamu hanya dapat menggunakan perintah Premium sekali sehari. Berlangganan Premium sekarang untuk mendapatkan akses tanpa batas.\n\nTunggu ${time} lagi untuk menggunakan perintah Premium.`,
		ERROR: () =>
			"Terjadi kesalahan pada sistem Miki. Mohon maaf atas ketidaknyamanannya. Silahkan coba beberapa saat lagi atau laporkan dengan perintah */feedback*.",
	},
	en: {
		CMD_NOT_FOUND: () =>
			"Sorry, Miki can't recognize the command.\n\nTell Miki using */feedback* command if you want the feature to be added. Miki will help u tell my owner!",
		INT_NOT_FOUND: () => "Sorry, Miki can't understand.\n\nCould you please teach Miki using the */feedback* command...?",
		NOT_OWNER: () => "Only my owner can give Miki this command.",
		NOT_ADMIN: () => "Only the group admin can give Miki this command.",
		NOT_GROUP: () => "You must be in a group to be able to give Miki this command.",
		NOT_PRIVATE: () => "You must be in a private chat to be able to give Miki this command.",
		NOT_PREMIUM: () => "This command is only for Premium members. You must be a Premium member to use this command.",
		NOT_PRIVATE_ADMIN: () => "This command can only be used inside a private chat or admins if inside a group chat.",
		SPAM: (s: number) => `Please give a delay for ${s} seconds before starting a new command.`,
		FIRSTTIME_CMD_DESC: (cmd: string, desc: string, prem: boolean) =>
			`*Introduction to _/${cmd}_*\n\n${
				prem ? `_Perintah ini adalah perintah Premium._\n\n` : ""
			}${desc}\n\nYou can see this help message again by using the command:\n*/help (space) command name*`,
		CANCELED: () => `Operation canceled.`,
		CANCEL: () => "Cancel",
		PREMIUM_LIMIT: (time: string) =>
			`You can only use Premium commands once per day. Subscribe to Premium for unlimited access.\n\nWait for ${time} to use Premium commands.`,
		ERROR: () => "There was an error in Miki's system. Sorry for the inconvenience. Please try again at a later time or report it using the */feedback* command.",
	},
};
