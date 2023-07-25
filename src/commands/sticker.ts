import { command, MessageContext, randomFileName, requestMessage, saveFile } from "../utils";
import * as fs from "fs";
import { exec } from "child_process";

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
		WRONG: () => "Format tidak didukung.",
		MISSING: () => "Silahkan kirim atau balas ke pesan gambar, video atau dokumen.",
		SUPPORTED: (supported: string) => "Format yang didukung: " + supported + " (maksimal 1,5 MB)",
	},
	en: {
		NOTPREMIUM: () => "Setting both the pack and author name of the sticker can only be done by Premium users.",
		WRONG: () => "Unsupported format.",
		MISSING: () => "Please send or reply to an image, video or document.",
		SUPPORTED: (supported: string) => "Supported formats: " + supported + " (max 1.5 MB)",
	},
};

command.new({
	onCommand: async (context) => {
		const language = context.language().out;
		const content = context.msgContent().out;
		const quotedContent = context.quotedMsgContent().out;
		function isValid(_content: typeof content | typeof quotedContent) {
			if (typeof _content !== "string" && _content && "mimetype" in _content && supportedMimeTypes.some((v) => v[0] === _content.mimetype)) {
				if (Number(_content.fileLength) < 1500000) return true;
			}
			return false;
		}

		let file: string;
		if (/image|video|document/.test(context.msgType().out || "")) {
			if (isValid(content)) {
				file = await saveFile((await context.media("stream").out)!);
			} else {
				return context.reply({ text: `${TEXTS[language].WRONG()}\n\n${TEXTS[language].SUPPORTED(supportedList)}` });
			}
		} else if (/image|video|document/.test(context.quotedMsgType().out || "")) {
			if (isValid(quotedContent)) {
				file = await saveFile((await context.quotedMedia("stream").out)!);
			} else {
				return context.reply({ text: `${TEXTS[language].WRONG()}\n\n${TEXTS[language].SUPPORTED(supportedList)}` });
			}
		} else {
			const [mediaContext] = await requestMessage(context, {
				messages: [
					[
						"",
						(c) => isValid(c.msgContent().out) || isValid(c.quotedMsgContent().out),
						{
							onMissing: `${TEXTS[language].MISSING()}\n\n${TEXTS[language].SUPPORTED(supportedList)}`,
							onWrong: `${TEXTS[language].WRONG()}\n\n${TEXTS[language].MISSING()}\n\n${TEXTS[language].SUPPORTED(supportedList)}`,
						},
					],
				],
			});
			if (mediaContext === null) return;
			if (isValid(mediaContext.msgContent().out)) {
				file = await saveFile((await mediaContext.media("stream").out)!);
			} else {
				file = await saveFile((await mediaContext.quotedMedia("stream").out)!);
			}
		}

		return await new Promise((resolve, reject) => {
			const output = randomFileName();
			exec(
				`ffmpeg -i ${file} -vcodec libwebp -compression_level 6 -q:v 25 -b:v 200k -vf "scale='if(gt(a,1),520,-1)':'if(gt(a,1),-1,520)':flags=lanczos:force_original_aspect_ratio=decrease,format=bgra,pad=520:520:-1:-1:color=#00000000,setsar=1" -f webp ${output}`,
				(e) => {
					if (e) return reject(e);
					let [pack, author] = (context.arguments().out || "").split(/\s*\|\s*/);
					if (author && !context.isPremiumUser().out) {
						context.reply({ text: TEXTS[language].NOTPREMIUM() });
						author = "";
					}
					let exifFile: string;
					if (!pack && !author) exifFile = "./res/default.exif";
					else exifFile = generateExif(pack, author || "Miki Bot by Rioze");
					exec(`webpmux -set exif ${exifFile} ${output} -o ${output}`, (e) => {
						if (e) console.error(e);
						resolve(context.reply({ sticker: { url: output } }));
					});
				}
			);
		});
	},
	metadata: {
		__filename,
		category: "mediatools",
		command: ["sticker", "stiker", "s"],
		permission: "all",
		locale: {
			description: {
				id: "[TODO] sticker description",
				en: "[TODO] sticker description",
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
	let len: number | string = new TextEncoder("utf-8").encode(json).length;
	const f = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00]);
	const code = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00];
	len > 256 ? ((len = len - 256), code.unshift(0x01)) : code.unshift(0x00);
	len < 16 ? (len = "0" + len) : (len = len.toString(16));
	const buffer = Buffer.concat([f, Buffer.from(len, "hex"), Buffer.from(code), Buffer.from(json, "utf-8")]);
	const filename = randomFileName();
	return fs.writeFileSync(filename, buffer), filename;
}
