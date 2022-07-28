import { basicTexts, btn, command, randomFileName, saveFile } from "../utils";
import { exec } from "child_process";
import * as fs from "fs";

const supportedMimeTypes: string[][] = [
	["image/jpeg", "jpg"],
	["image/png", "png"],
	["image/gif", "gif"],
	["video/mp4", "mp4"],
	["image/webp", "webp"],
	["video/mpeg", "mpeg"],
	["video/x-msvideo", "avi"],
	["video/ogg", "ogv"],
	["video/webm", "webm"],
	["video/3gpp", "3gp"],
];
const supportedList = supportedMimeTypes.map((v) => v[1].toUpperCase()).join("/");

const TEXTS = {
	id: {
		NOTPREMIUM: () => "Mengatur kedua nama paket dan pembuat stiker hanya dapat dilakukan oleh pengguna Premium.",
		PROCESSING: (number: number) => "Memproses " + number + " media...",
		FAILED: (number: number) => "Gagal memproses " + number + " media.",
		DONE: () => "Selesai",
		ASK: () => "Silahkan kirim atau balas ke beberapa pesan gambar, video atau dokumen. *Maksimal 20*",
		SUPPORTED: (supported: string) => "Format yang didukung: " + supported + " (maksimal 1,5 MB)",
	},
	en: {
		NOTPREMIUM: () => "Setting both the pack and author name of the sticker can only be done by Premium users.",
		PROCESSING: (number: number) => "Processing " + number + " media...",
		FAILED: (number: number) => "Failed processing " + number + " media.",
		DONE: () => "Done",
		ASK: () => "Please send or reply to one or more image, video or document messages. *Max 20*",
		SUPPORTED: (supported: string) => "Supported formats: " + supported + " (max 1.5 MB)",
	},
};

command.new({
	onCommand: async (context, bot) => {
		const language = context.language().out;
		context.reply({
			text: TEXTS[language].ASK() + "\n\n" + TEXTS[language].SUPPORTED(supportedList),
			...btn([TEXTS[language].DONE(), basicTexts[language].CANCEL()]),
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
				if (typeof _content !== "string" && _content && "mimetype" in _content && supportedMimeTypes.some((v) => v[0] === _content.mimetype)) {
					if (_content.fileLength! < 1500000) return true;
				}
				return false;
			};

			if (isValid(content)) {
				response.react("✅");
				media.push(response);
			} else if (isValid(quotedContent)) {
				response.react("✅");
				quotedMedia.push(response);
			} else {
				response.react("❌").reply({ text: TEXTS[language].SUPPORTED(supportedList) });
			}
			if (media.length + quotedMedia.length === 20) break;
		}

		context.reply({ text: TEXTS[language].PROCESSING(media.length + quotedMedia.length) });
		let [pack, author] = (context.arguments().out || "").split(/\s*\|\s*/);
		if (author && !context.isPremiumUser().out) {
			context.reply({ text: TEXTS[language].NOTPREMIUM() });
			author = "";
		}
		let exifFile: string;
		if (!pack && !author) exifFile = "./res/default.exif";
		else exifFile = generateExif(pack, author || "Miki Bot by Rioze");

		const tasks: Promise<void>[] = [];
		for (const _media of media) {
			tasks.push(
				new Promise((resolve, reject) => {
					_media
						.media("stream")
						.out!.then((stream) => saveFile(stream!))
						.then((file) => processSticker(file))
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
						.then((file) => processSticker(file))
						.then(resolve)
						.catch(reject);
				})
			);
		}
		return await Promise.allSettled(tasks).then((results) => {
			const rejected = results.filter(({ status }) => status === "rejected");
			if (rejected.length) context.reply({ text: TEXTS[language].FAILED(rejected.length) });
		});

		function processSticker(file: string) {
			return new Promise<any>((resolve, reject) => {
				const output = randomFileName();
				exec(
					`ffmpeg -i ${file} -vcodec libwebp -compression_level 6 -q:v 25 -b:v 200k -vf "scale='if(gt(a,1),520,-1)':'if(gt(a,1),-1,520)':flags=lanczos:force_original_aspect_ratio=decrease,format=bgra,pad=520:520:-1:-1:color=#00000000,setsar=1" -f webp ${output}`,
					(e) => {
						if (e) return reject(e);
						exec(`webpmux -set exif ${exifFile} ${output} -o ${output}`, (e) => {
							if (e) console.error(e);
							resolve(context.reply({ sticker: { url: output } }, { quoted: undefined }));
						});
					}
				);
			});
		}
	},
	metadata: {
		__filename,
		category: "mediatools",
		command: ["batchsticker"],
		permission: "all",
		premium: true,
		locale: {
			description: {
				id: "[TODO] batchsticker description",
				en: "[TODO] batchsticker description",
			},
			name: {
				id: "stiker sekaligus",
			},
		},
	},
});

function generateExif(pack: string = "", author: string = "") {
	const json = JSON.stringify({
		"sticker-pack-name": pack,
		"sticker-pack-publisher": author,
	});
	// @ts-ignore
	let len = new TextEncoder("utf-8").encode(json).length;
	const f = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00]);
	const code = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00];
	len > 256 ? ((len = len - 256), code.unshift(0x01)) : code.unshift(0x00);
	len < 16 ? (len = "0" + len) : (len = len.toString(16));
	const buffer = Buffer.concat([f, Buffer.from(len, "hex"), Buffer.from(code), Buffer.from(json, "utf-8")]);
	const filename = randomFileName();
	return fs.writeFileSync(filename, buffer), filename;
}
