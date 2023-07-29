import { command, randomFileName, requestMessage, saveFile } from "../utils";
import { exec } from "child_process";

const TEXTS = {
	id: {
		STICKER: () => "Stiker",
	},
	en: {
		STICKER: () => "Sticker",
	},
};

command.new({
	onCommand: async (context) => {
		const language = context.language().out;
		const content = context.msgContent().out;
		const quotedContent = context.quotedMsgContent().out;
		function isValid(_content: typeof content | typeof quotedContent) {
			if (typeof _content !== "string" && _content && "mimetype" in _content && _content.mimetype === "image/webp") {
				return true;
			}
			return false;
		}

		let file: string;
		let isAnimated = false;
		const qContent = context.quotedMsgContent().out;
		if (isValid(qContent)) {
			file = await saveFile((await context.quotedMedia("stream").out)!);
			if (typeof qContent !== "string" && "isAnimated" in qContent! && qContent.isAnimated) isAnimated = true;
		} else {
			const [stickerContext] = await requestMessage(context, {
				messages: [[TEXTS[language].STICKER(), (c) => isValid(c.msgContent().out) || isValid(c.quotedMsgContent().out)]],
			});
			if (stickerContext === null) return;
			if (isValid(stickerContext.msgContent().out)) {
				file = await saveFile((await stickerContext.media("stream").out)!);
				const content = stickerContext.msgContent().out;
				if (typeof content !== "string" && "isAnimated" in content && content.isAnimated) isAnimated = true;
			} else {
				file = await saveFile((await stickerContext.quotedMedia("stream").out)!);
				const qContent = stickerContext.quotedMsgContent().out!;
				if (typeof qContent !== "string" && "isAnimated" in qContent && qContent.isAnimated) isAnimated = true;
			}
		}

		if (isAnimated) {
			const outputGif = randomFileName();
			const outputMp4 = randomFileName();
			return await new Promise((resolve, reject) => {
				exec(`convert WEBP:${file} GIF:${outputGif}`, (e) => {
					if (e) return reject(e);
					exec(
						`ffmpeg -f gif -i ${outputGif} -vf "crop=trunc(iw/2)*2:trunc(ih/2)*2" -b:v 0 -crf 25 -f mp4 -vcodec libx264 -pix_fmt yuv420p ${outputMp4}`,
						(e) => {
							if (e) return reject(e);
							resolve(context.reply({ video: { url: outputMp4 }, gifPlayback: true }));
						}
					);
				});
			});
		} else {
			const outputPng = randomFileName();
			return await new Promise((resolve, reject) => {
				exec(`dwebp ${file} -o ${outputPng}`, (e) => {
					if (e) return reject(e);
					resolve(context.reply({ image: { url: outputPng } }));
				});
			});
		}
	},
	metadata: {
		__filename,
		category: "mediatools",
		command: ["unsticker", "unstiker", "uns"],
		permission: "all",
		locale: {
			description: {
				id: "[TODO] unstiker description",
				en: "[TODO] unstiker description",
			},
		},
	},
});
