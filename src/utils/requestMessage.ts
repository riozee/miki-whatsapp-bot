import { MessageContext, btn, basicTexts } from "./";
import * as Baileys from "@adiwajshing/baileys";

type msgType = [
	string,
	(Baileys.MessageType | ((x: MessageContext) => boolean))?,
	{
		onWrong?: string | ((context: MessageContext) => string);
		onMissing?: string | ((context: MessageContext) => string);
	}?
];
type msgShape = {
	messages: msgType[];
	onCancel?: string | ((context: MessageContext | "timeout") => string);
	customInput?: MessageContext;
};

const TEXTS = {
	id: {
		MSG_MISSING: (name: string) => `Silahkan kirim ${name}...`,
		MSG_WRONG: (name: string) => `Pesan bukan ${name}.\n\nSilahkan ulangi...`,
		BTN_CANCEL: () => "Batal",
		CANCELED: () => basicTexts.id.CANCELED(),
	},
	en: {
		MSG_MISSING: (name: string) => `Please send a(n) ${name}...`,
		MSG_WRONG: (name: string) => `The message is not a(n) ${name}.\n\nPlease resend...`,
		BTN_CANCEL: () => "Cancel",
		CANCELED: () => basicTexts.en.CANCELED(),
	},
};

/**
 * Use it like this:
 * ```ts
 * const [imageMessageContext] = await requestMessage(context, {
 *  messages: [
 *      ['image', 'imageMessage'],
 *  ]
 * });
 * if (imageMessageContext === null) return; // canceled
 * ```
 */
export async function requestMessage(context: MessageContext, shape: msgShape): Promise<[MessageContext | null, ...MessageContext[]]> {
	const lang = context.language().out;
	function isCanceled(response: MessageContext | "timeout"): response is "timeout" {
		if (response === "timeout") return true;
		if (new RegExp(`^${TEXTS[lang].BTN_CANCEL()}$`, "i").test(response.text().out || "")) return true;
		return false;
	}
	function getCustomInput() {
		if (!shape.customInput) return;
		const customInput = shape.customInput;
		delete shape.customInput;
		return customInput;
	}
	const messages: MessageContext[] = [];
	for (const [_idx, msgShape] of Object.entries(shape.messages)) {
		let msg = {
			text:
				typeof msgShape[2]?.onMissing === "string"
					? msgShape[2].onMissing
					: typeof msgShape[2]?.onMissing === "function"
					? msgShape[2].onMissing(context)
					: TEXTS[lang].MSG_MISSING(msgShape[0]),
			...btn([TEXTS[lang].BTN_CANCEL()]),
		};
		while (true) {
			let isCustomInput: any;
			const response = (isCustomInput = getCustomInput()) || (await context.reply(msg).waitInput().out);
			if (isCanceled(response)) {
				context.reply({ text: typeof shape.onCancel === "function" ? shape.onCancel(response) : TEXTS[lang].CANCELED() });
				return [null];
			}
			if (typeof msgShape[1] === "function" ? msgShape[1](response) : response.msgType().out === msgShape[1]) {
				messages.push(response);
				break;
			} else {
				if (!isCustomInput) {
					msg = {
						text:
							typeof msgShape[2]?.onWrong === "string"
								? msgShape[2].onWrong
								: typeof msgShape[2]?.onWrong === "function"
								? msgShape[2].onWrong(response)
								: TEXTS[lang].MSG_WRONG(msgShape[0]),
						...btn([TEXTS[lang].BTN_CANCEL()]),
					};
				}
				continue;
			}
		}
	}

	return [...messages] as [MessageContext | null, ...MessageContext[]];
}
