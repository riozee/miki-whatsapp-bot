import { MessageContext, btn, basicTexts } from "./";

type argType = [
	string,
	("string" | RegExp | ((x: string) => boolean))?,
	{
		required?: boolean;
		onMissing?: string | ((context: MessageContext) => string);
		onWrong?: string | ((context: MessageContext) => string);
	}?
];
type argsShape = {
	arguments: argType[];
	separator?: string | RegExp | ((x: string) => string[]);
	onCancel?: string | ((context: MessageContext | "timeout") => string);
	customInput?: string;
};

const TEXTS = {
	id: {
		ARG_MISSING: (name: string) => `Silahkan kirim ${name}...`,
		ARG_WRONG: (name: string) => `Data yang kamu masukkan tidak valid.\n\nSilahkan kirim ulang ${name}...`,
		BTN_CANCEL: () => "Batal",
		CANCELED: () => basicTexts.id.CANCELED(),
	},
	en: {
		ARG_MISSING: (name: string) => `Please enter the ${name}...`,
		ARG_WRONG: (name: string) => `The data you've sent is not valid.\n\nPlease reenter the ${name}...`,
		BTN_CANCEL: () => "Cancel",
		CANCELED: () => basicTexts.en.CANCELED(),
	},
};

/**
 * Use it like this:
 * ```ts
 * const [name, age, email] = await requestArguments(context, {
 *  separator: /\s+/g,
 *  arguments: [
 *      ['name'],
 *      ['age', 'number']
 *      ['email', /[a-z\d]+@[a-z]+\.[a-z]+/i, {
 *          required: false,
 *          onWrong: context => `${context.text().out} is not a valid email address`
 *      }]
 *  ]
 * });
 * if (name === null) return; // canceled
 * ```
 *
 * `separator` is default to whitespace `/\s+/g`.
 *
 * The `arguments` shape consists of an array of the following:
 * ```ts
 * [name, validator, {
 *  required?: boolean,
 *  onWrong?: string | (context => string),
 *  onMissing?: string | (context => string)
 * }?]
 * ```
 */
export async function requestArguments(context: MessageContext, shape: argsShape): Promise<[string | null, ...string[]]> {
	const lang = context.language().out;
	const text = shape.customInput ?? context.arguments().out;
	const args: string[] = text ? (typeof shape.separator === "function" ? shape.separator(text) : text.split(shape.separator ?? /\s+/g)) : [];
	function isCanceled(response: MessageContext | "timeout"): response is "timeout" {
		if (response === "timeout") return true;
		if (new RegExp(`^${TEXTS[lang].BTN_CANCEL()}$`, "i").test(response.text().out || "")) return true;
		return false;
	}

	for (const [_idx, argShape] of Object.entries(shape.arguments)) {
		const idx = +_idx;

		while (true) {
			if (typeof args[idx] === "undefined") {
				const response = await context
					.reply({
						text:
							typeof argShape[2]?.onMissing === "string"
								? argShape[2].onMissing
								: typeof argShape[2]?.onMissing === "function"
								? argShape[2].onMissing(context)
								: TEXTS[lang].ARG_MISSING(argShape[0]),
						...btn([TEXTS[lang].BTN_CANCEL()]),
					})
					.waitInput().out;
				if (isCanceled(response)) {
					context.reply({ text: typeof shape.onCancel === "function" ? shape.onCancel(response) : TEXTS[lang].CANCELED() });
					return [null];
				}
				context = response;
				const text = context.text().out;
				if (text) args[idx] = text;
				continue;
			} else {
				if (typeof argShape[1] === "undefined" || argShape[1] === "string") {
					break;
				} else if (argShape[1] instanceof RegExp && argShape[1].test(args[idx])) {
					break;
				} else if (typeof argShape[1] === "function" && argShape[1](args[idx])) {
					break;
				} else {
					const response = await context
						.reply({
							text:
								typeof argShape[2]?.onWrong === "string"
									? argShape[2].onWrong
									: typeof argShape[2]?.onWrong === "function"
									? argShape[2].onWrong(context)
									: TEXTS[lang].ARG_WRONG(argShape[0]),
							...btn([TEXTS[lang].BTN_CANCEL()]),
						})
						.waitInput().out;
					if (isCanceled(response)) {
						context.reply({ text: typeof shape.onCancel === "function" ? shape.onCancel(response) : TEXTS[lang].CANCELED() });
						return [null];
					}
					context = response;
					const text = context.text().out;
					if (text) args[idx] = text;
					continue;
				}
			}
		}
	}

	return [...args] as [string | null, ...string[]];
}
