import { command, basicTexts, saveFile, randomFileName } from "../utils";
import { exec } from "child_process";

const TEXTS = {
	id: {
		PROCESSING: (number: number) => "Memproses " + number + " stiker...",
		FAILED: (number: number) => "Gagal memproses " + number + " stiker.",
		DONE: () => "Selesai",
		ASK: () => "Silahkan kirim atau balas ke beberapa stiker. *Maksimal 20*\n\nKetik *selesai* jika selesai atau *batal*.",
		NOTSTICKER: () => "Itu bukan stiker.",
	},
	en: {
		PROCESSING: (number: number) => "Processing " + number + " sticker" + (number === 1 ? "" : "s") + "...",
		FAILED: (number: number) => "Failed processing " + number + " sticker" + (number === 1 ? "" : "s") + ".",
		DONE: () => "Done",
		ASK: () => "Please send or reply to one or more stickers. *Max 20*\n\nType *done* if done or *cancel*.",
		NOTSTICKER: () => "That's not a sticker.",
	},
};

command.new({
	onCommand: async (context, bot) => {
		const language = context.language().out;
		context.reply({
			text: TEXTS[language].ASK(),
		});
		const media: typeof context[] = [];
		const quotedMedia: typeof context[] = [];

		while (true) {
			const response = await context.waitInput().out;
			if (response === "timeout" || response.text().out?.toLowerCase() === basicTexts[language].CANCEL().toLowerCase())
				return context.reply({ text: basicTexts[language].CANCELED() });
			if (response.text().out?.toLowerCase() === TEXTS[language].DONE().toLowerCase()) break;

			const content = response.msgContent().out;
			const quotedContent = response.quotedMsgContent().out;
			const isValid = (_content: typeof content | typeof quotedContent) => {
				if (typeof _content !== "string" && _content && "mimetype" in _content && _content.mimetype === "image/webp") return true;
				return false;
			};

			if (isValid(content)) {
				response.react("✅");
				media.push(response);
			} else if (isValid(quotedContent)) {
				response.react("✅");
				quotedMedia.push(response);
			} else {
				response.react("❌").reply({ text: TEXTS[language].NOTSTICKER() });
			}
			if (media.length + quotedMedia.length === 20) break;
		}

		context.reply({ text: TEXTS[language].PROCESSING(media.length + quotedMedia.length) });

		const tasks: Promise<void>[] = [];
		for (const _media of media) {
			tasks.push(
				new Promise((resolve, reject) => {
					_media
						.media("stream")
						.out!.then((stream) => saveFile(stream!))
						.then((file) => {
							let isAnimated = false;
							const content = _media.msgContent().out;
							if (typeof content !== "string" && "isAnimated" in content && content.isAnimated) isAnimated = true;
							return processSticker(file, isAnimated);
						})
						.then(resolve)
						.catch(reject);
				})
			);
		}
		for (const _media of quotedMedia) {
			tasks.push(
				new Promise((resolve, reject) => {
					_media
						.quotedMedia("stream")
						.out!.then((stream) => saveFile(stream!))
						.then((file) => {
							let isAnimated = false;
							const content = _media.msgContent().out;
							if (typeof content !== "string" && "isAnimated" in content && content.isAnimated) isAnimated = true;
							return processSticker(file, isAnimated);
						})
						.then(resolve)
						.catch(reject);
				})
			);
		}
		return await Promise.allSettled(tasks).then((results) => {
			const rejected = results.filter(({ status }) => status === "rejected");
			if (rejected.length) context.reply({ text: TEXTS[language].FAILED(rejected.length) });
		});

		function processSticker(file: string, isAnimated: boolean) {
			return new Promise<any>((resolve, reject) => {
				if (isAnimated) {
					const outputGif = randomFileName();
					const outputMp4 = randomFileName();
					exec(`convert WEBP:${file} GIF:${outputGif}`, (e) => {
						if (e) return reject(e);
						exec(
							`ffmpeg -f gif -i ${outputGif} -vf "crop=trunc(iw/2)*2:trunc(ih/2)*2" -b:v 0 -crf 25 -f mp4 -vcodec libx264 -pix_fmt yuv420p ${outputMp4}`,
							(e) => {
								if (e) return reject(e);
								resolve(context.reply({ video: { url: outputMp4 }, gifPlayback: true }, { quoted: undefined }));
							}
						);
					});
				} else {
					const outputPng = randomFileName();
					exec(`dwebp ${file} -o ${outputPng}`, (e) => {
						if (e) return reject(e);
						resolve(context.reply({ image: { url: outputPng } }, { quoted: undefined }));
					});
				}
			});
		}
	},
	metadata: {
		__filename,
		category: "mediatools",
		command: ["batchunsticker"],
		permission: "all",
		premium: true,
		locale: {
			description: {
				id: "[TODO] batchunsticker description",
				en: "[TODO] batchunsticker description",
			},
			name: {
				id: "unstiker sekaligus",
			},
		},
	},
});
