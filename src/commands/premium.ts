import { command, tbtn } from "../utils";

const TEXTS = {
	id: {
		PREMSTATS: () => "Status Premium:",
		ACTIVE: () => "*AKTIF*",
		INACTIVE: () => "TIDAK AKTIF",
		UNTIL: () => "s/d",
		INACTIVE_FOOTER: (cust_number: string) =>
			"Ingin berlangganan Premium? Silahkan hubungi wa.me/" + cust_number + " atau tekan tombol hubungi di bawah untuk menghubungi Customer Service Miki Bot.",
		BENEFITS: () =>
			"Keuntungan Premium:\n1. Akses tanpa batas ke perintah-perintah Premium.\n2. Akses tanpa batas ke fitur-fitur menarik di dalam perintah\n3. Waktu jeda lebih sedikit.\n4. Memungkinkan Miki Bot tetap hidup dan terus berkembang.",
		CHAT: () => "Chat Customer Service",
	},
	en: {
		PREMSTATS: () => "Premium Status:",
		ACTIVE: () => "*ACTIVE*",
		INACTIVE: () => "INACTIVE",
		UNTIL: () => "until",
		INACTIVE_FOOTER: (cust_number: string) =>
			"Want to subscribe to Premium? Please contact Miki Bot Customer Service at wa.me/" + cust_number + " or click the Chat button below.",
		BENEFITS: () =>
			"Premium Benefits:\n1. Unlimited access to Premium commands.\n2. Unlimited access to interesting features in commands\n3. Lower delay time.\n4. Allows Miki Bot to stay alive and growing.",
		CHAT: () => "Chat Customer Service",
	},
};

command.new({
	onCommand: (context) => {
		const T = TEXTS[context.language().out];
		if (context.isPremiumUser().out) {
			const premiumUntil = context.userData().out.premiumUntil;
			context.reply({
				text: `${T.PREMSTATS()} ${T.ACTIVE()} ${T.UNTIL()} ${new Date(premiumUntil!).toLocaleString()}\n\n${T.BENEFITS()}`,
			});
		} else {
			context.reply({
				text: `${T.PREMSTATS()} ${T.INACTIVE()}\n\n${T.INACTIVE_FOOTER(process.env.CUSTOMER_SERVICE_NUMBER!)}\n\n${T.BENEFITS()}`,
				...tbtn(["/feedback", { url: "https://wa.me/" + process.env.CUSTOMER_SERVICE_NUMBER, text: T.CHAT() }]),
			});
		}
	},
	metadata: {
		__filename,
		category: "botsettings",
		command: ["premium"],
		permission: "all",
		locale: {
			description: {
				id: "[TODO] premium description",
				en: "[TODO] premium description",
			},
		},
	},
});
