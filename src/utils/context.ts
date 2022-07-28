import type * as Types from "./typings/types";
import makeWASocket, * as Baileys from "@adiwajshing/baileys";
import Promptees, { PrompteesOpts } from "promptees";
import { escapeRegExp } from "lodash";
const PREFIXES = process.env.PREFIX?.split("") || ["/"];

export function createMessageContext(LOCALDB: Types.LOCALDB, bot: ReturnType<typeof makeWASocket>, promptees: Promptees<any>) {
	return class Context<O> {
		private _out: any = undefined;

		constructor(
			/**
			 * Incoming message
			 */
			public update: Baileys.WAProto.IWebMessageInfo
		) {}

		get out(): O {
			return this._out;
		}

		/**
		 * It basically a method to modify the `context.out` value.
		 *
		 * With it you can create a different design pattern, e.g:
		 * ```js
		 * ctx.text().and(o => o.toUpperCase()).and((o, ctx) => ctx.reply({
		 *     text: `You said "${o}" in upper case.`
		 * }));
		 * ```
		 */
		and<_O>(fn: (out: O, thisContext: this) => _O) {
			this._out = fn(this._out, this);
			return this as unknown as Context<_O>;
		}

		/**
		 * Also known as the sender id. If in a private chat, the id will be the same as the chat id.
		 *
		 * ```js
		 * ctx.userId().out;
		 * ```
		 */
		userId() {
			this._out = (this.update.key.participant || this.update.participant || this.update.key.remoteJid)!;
			return this as unknown as Context<string>;
		}

		/**
		 * The chat id. If in a private chat, the id will be the same as the user id.
		 *
		 * ```js
		 * ctx.chatId().out;
		 * ```
		 */
		chatId() {
			this._out = this.update.key.remoteJid!;
			return this as unknown as Context<string>;
		}

		/**
		 * Data from the bot system. Can be accessed from any chat.
		 *
		 * ```js
		 * ctx.systemData().out;
		 * ```
		 */
		systemData() {
			this._out = LOCALDB.system;
			return this as unknown as Context<Types.SYSTEMDB>;
		}

		/**
		 * Chat data. If in a private chat, `userData().out` and `chatData().out` are the same object.
		 *
		 * ```js
		 * ctx.chatData().out;
		 * ```
		 */
		chatData() {
			this._out = LOCALDB[this.chatId().out];
			return this as unknown as Context<Types.GROUPDB>;
		}

		/**
		 * User data. If in a private chat, `userData().out` and `chatData().out` are the same object.
		 *
		 * ```js
		 * ctx.userData().out;
		 * ```
		 */
		userData() {
			this._out = LOCALDB[this.userId().out];
			return this as unknown as Context<Types.USERDB>;
		}

		/**
		 * Language used in the chat (`"id"` or `"en"`). Defaults to `"id"`.
		 *
		 * ```js
		 * ctx.language().out;
		 * ```
		 */
		language() {
			this._out = this.chatData().out.language || "id";
			return this as unknown as Context<"id" | "en">;
		}

		/**
		 * This message type.
		 *
		 * Examples: `'imageMessage', 'extendedTextMessage', 'stickerMessage', ...`
		 *
		 * ```js
		 * ctx.msgType().out;
		 * ```
		 */
		msgType() {
			this._out = Object.keys(this.update.message!).filter((v) => {
				return v !== "messageContextInfo" && v !== "senderKeyDistributionMessage";
			})[0] as keyof Baileys.WAProto.IMessage;
			return this as unknown as Context<keyof Baileys.WAProto.IMessage>;
		}

		/**
		 * This message content.
		 *
		 * ```js
		 * ctx.msgContent().out;
		 * ```
		 */
		msgContent() {
			this._out = this.update.message![this.msgType().out]!;
			return this as unknown as Context<NonNullable<Baileys.WAProto.IMessage[keyof Baileys.WAProto.IMessage]>>;
		}

		/**
		 * Downloads the media on this message. Resolves to undefined if the message type is not media.
		 *
		 * ```js
		 * await ctx.media(...).out;
		 * ```
		 */
		media(type: "buffer", options?: Baileys.MediaDownloadOptions): Context<Promise<Buffer | undefined>>;
		media(type: "stream", options?: Baileys.MediaDownloadOptions): Context<Promise<import("stream").Transform | undefined>>;
		media(type: "buffer" | "stream", options: Baileys.MediaDownloadOptions = {}) {
			const content = this.msgContent().out;
			if (typeof content === "object" && "url" in content) {
				this._out = Baileys.downloadMediaMessage(this.update, type, options);
			} else {
				this._out = undefined;
			}
			return this as unknown as Context<Promise<Buffer | import("stream").Transform | undefined>>;
		}

		/**
		 * Downloads the media of quoted message. Resolves to undefined if the message type is not media.
		 *
		 * ```js
		 * await ctx.media(...).out;
		 * ```
		 */
		quotedMedia(type: "buffer", options?: Baileys.MediaDownloadOptions): Context<Promise<Buffer | undefined>>;
		quotedMedia(type: "stream", options?: Baileys.MediaDownloadOptions): Context<Promise<import("stream").Transform | undefined>>;
		quotedMedia(type: "buffer" | "stream", options: Baileys.MediaDownloadOptions = {}) {
			const content = this.quotedMsgContent().out;
			if (content && typeof content === "object" && "url" in content) {
				this._out = Baileys.downloadMediaMessage(
					{ key: {}, message: { [this.quotedMsgType().out!]: content } } as Baileys.WAProto.IWebMessageInfo,
					type,
					options
				);
			} else {
				this._out = undefined;
			}
			return this as unknown as Context<Promise<Buffer | import("stream").Transform | undefined>>;
		}

		/**
		 * This quoted message type. `undefined` if no message is quoted.
		 *
		 * Examples: `'imageMessage', 'extendedTextMessage', 'stickerMessage', ...`
		 *
		 * ```js
		 * ctx.quotedMsgType().out;
		 * ```
		 */
		quotedMsgType() {
			const content = this.msgContent().out;
			if (
				typeof content !== "string" &&
				"contextInfo" in content &&
				content.contextInfo &&
				"quotedMessage" in content.contextInfo &&
				content.contextInfo.quotedMessage
			) {
				this._out = Object.keys(content.contextInfo.quotedMessage)[0];
			} else {
				this._out = undefined;
			}
			return this as unknown as Context<keyof Baileys.WAProto.IMessage | undefined>;
		}

		/**
		 * This quoted message content. `undefined` if no message is quoted.
		 *
		 * ```js
		 * ctx.quotedMsgContent().out;
		 * ```
		 */
		quotedMsgContent() {
			const content = this.msgContent().out;
			if (
				typeof content !== "string" &&
				"contextInfo" in content &&
				content.contextInfo &&
				"quotedMessage" in content.contextInfo &&
				content.contextInfo.quotedMessage
			) {
				this._out = content.contextInfo.quotedMessage![this.quotedMsgType().out!];
			} else {
				this._out = undefined;
			}
			return this as unknown as Context<Baileys.WAProto.IMessage[keyof Baileys.WAProto.IMessage] | undefined>;
		}

		/**
		 * Text of this message. `undefined` if the message contains no text.
		 *
		 * ```js
		 * ctx.text().out;
		 * ```
		 */
		text() {
			const content = this.msgContent().out;
			if (typeof content === "string") this._out = content;
			else if ("text" in content) this._out = content.text!;
			else if ("caption" in content) this._out = content.caption!;
			else if ("singleSelectReply" in content) this._out = content.singleSelectReply?.selectedRowId!;
			else if ("selectedDisplayText" in content) this._out = content.selectedDisplayText!;
			else if ("contentText" in content) this._out = content.contentText + "\n\n" + content.footerText;
			else this._out = undefined;
			return this as unknown as Context<string | undefined>;
		}

		/**
		 * Text of the quoted message. `undefined` if not quoting any message or the message contains no text.
		 *
		 * ```js
		 * ctx.quotedText().out;
		 * ```
		 */
		quotedText() {
			const content = this.quotedMsgContent().out;
			if (content) {
				if (typeof content === "string") this._out = content;
				else if ("text" in content) this._out = content.text!;
				else if ("caption" in content) this._out = content.caption!;
				else if ("singleSelectReply" in content) this._out = content.singleSelectReply?.selectedRowId!;
				else if ("selectedDisplayText" in content) this._out = content.selectedDisplayText!;
				else if ("contentText" in content) this._out = content.contentText + "\n\n" + content.footerText;
				else this._out = undefined;
			} else {
				this._out = undefined;
			}
			return this as unknown as Context<string | undefined>;
		}

		/**
		 * The sender id of quoted message.
		 *
		 * ```js
		 * ctx.quotedUserId().out;
		 * ```
		 */
		quotedUserId() {
			const content = this.msgContent().out;
			if (typeof content !== "string" && "contextInfo" in content) {
				this._out = content.contextInfo?.participant!;
			} else {
				this._out = undefined;
			}
			return this as unknown as Context<string | undefined>;
		}

		/**
		 * The chat id of quoted message. The id can be different from the current chat, for example when user replies privately to the bot message in another group.
		 *
		 * ```js
		 * ctx.quotedChatId().out;
		 * ```
		 */
		quotedChatId() {
			const content = this.msgContent().out;
			if (typeof content !== "string" && "contextInfo" in content) {
				this._out = content.contextInfo?.remoteJid!;
			} else {
				this._out = undefined;
			}
			return this as unknown as Context<string | undefined>;
		}

		/**
		 * Gets an array containing the id of mentioned users. Undefined if message isn't mentioning anyone.
		 */
		mentions() {
			const content = this.msgContent().out;
			if (typeof content !== "string" && "contextInfo" in content) {
				const mentions = content.contextInfo?.mentionedJid || [];
				if (mentions.length) this._out = mentions;
				else this._out = undefined;
			} else {
				this._out = undefined;
			}
			return this as unknown as Context<string[] | undefined>;
		}

		/**
		 * Reply to this message (and quote the message).
		 *
		 * ```js
		 * ctx.reply(...);
		 * ctx.reply(...).out; //for obtaining the message update
		 * (new MessageContext(await ctx.reply(...).out)).reply(...); // replying to someone's message and then reply to the sent message itself, hehe
		 * ```
		 */
		reply(content: Baileys.AnyMessageContent, options: Baileys.MiscMessageGenerationOptions = {}) {
			const msgContent = this.msgContent().out;
			this._out = bot.sendMessage(this.chatId().out, content, {
				quoted: this.update,
				ephemeralExpiration: typeof msgContent !== "string" && "contextInfo" in msgContent ? msgContent.contextInfo?.expiration! : undefined,
				...options,
			});
			return this as unknown as Context<Promise<Baileys.WAProto.WebMessageInfo>>;
		}

		/**
		 * React to this message. Just one emoji is allowed.
		 *
		 * ```js
		 * ctx.react('❤');
		 * ```
		 */
		react(emoji: string) {
			const msg = Baileys.proto.Message.fromObject({
				reactionMessage: {
					key: {
						fromMe: this.update.key.fromMe || false,
						id: this.update.key.id,
						remoteJid: this.chatId().out,
						participant: this.userId().out,
					},
					text: emoji,
					senderTimestampMs: Date.now().toString(),
				},
			});
			this._out = bot.relayMessage(this.chatId().out, msg, {
				messageId: Baileys.generateMessageID(),
			});
			return this as unknown as Context<string>;
		}

		/**
		 * Wait until the user sends another message in the same chat. Returns a new `Context` object from the new message. Returns the string `"timeout"` after 15 minutes without response.
		 *
		 * @see - https://npmjs.com/promptees
		 *
		 * ```js
		 * await ctx.waitInput().out;
		 * ```
		 */
		waitInput<OnTimeout = "timeout">(opts?: PrompteesOpts<Context<undefined>, OnTimeout>) {
			this._out = promptees.waitForResponse(this.userId().out + this.chatId().out, opts);
			return this as unknown as Context<Promise<OnTimeout | Context<undefined>>>;
		}

		/**
		 * Returns the argument of the command if the message begins with one of prefixes (`process.env.PREFIX`), replying or mentioning the bot.
		 *
		 * Example: `/echo This is the argument`
		 *
		 * ```js
		 * ctx.arguments().out;
		 * ```
		 */
		arguments() {
			const text = this.text().out?.trimStart();
			if (text) {
				if (this.isGroupChat().out) {
					const idx = PREFIXES.findIndex((p) => text.startsWith(p));
					if (idx !== -1) {
						this._out = text.replace(new RegExp(`^${escapeRegExp(PREFIXES[idx])}\\s*\\S*\\s*`), "");
					} else if (text.startsWith("@" + process.env.BOT_NUMBER)) {
						this._out = text.replace(new RegExp(`^@${process.env.BOT_NUMBER}\\s*\\S*\\s*`), "");
					} else if (this.quotedUserId().out === process.env.BOT_NUMBER + "@s.whatsapp.net") {
						this._out = text.replace(/^\S*\s*/, "");
					} else {
						this._out = undefined;
					}
				} else {
					this._out = text.replace(/^\S*\s*/, "");
				}
			} else {
				this._out = undefined;
			}
			return this as unknown as Context<string | undefined>;
		}

		/**
		 * Returns the name of current command if the message begins with one of prefixes (`process.env.PREFIX`), replying or mentioning the bot.
		 *
		 * Example: `/echo This is the argument`
		 *
		 * The command name will be: `"echo"`
		 *
		 * ```js
		 * ctx.command().out;
		 * ```
		 */
		command() {
			const text = this.text().out?.trimStart();
			if (text) {
				if (this.isGroupChat().out) {
					const idx = PREFIXES.findIndex((p) => text.startsWith(p));
					if (idx !== -1) {
						this._out = new RegExp(`^${escapeRegExp(PREFIXES[idx])}\\s*(\\S+)\\s*`).exec(text)?.[1]?.toLowerCase();
					} else if (text.startsWith("@" + process.env.BOT_NUMBER)) {
						this._out = text.slice(`@${process.env.BOT_NUMBER}`.length).trimStart().split(/\s+/, 1)[0].toLowerCase() || undefined;
					} else if (this.quotedUserId().out === process.env.BOT_NUMBER + "@s.whatsapp.net") {
						this._out = text.split(/\s+/, 1)[0].toLowerCase();
					} else {
						this._out = undefined;
					}
				} else {
					this._out = text.split(/\s+/, 1)[0].toLowerCase();
				}
			} else {
				this._out = undefined;
			}
			return this as unknown as Context<string | undefined>;
		}

		/**
		 * Returns `true` if the current chat is a group chat.
		 *
		 * ```js
		 * ctx.isGroupChat().out;
		 * ```
		 */
		isGroupChat() {
			this._out = this.chatId().out.endsWith("@g.us");
			return this as unknown as Context<boolean>;
		}

		/**
		 * Resolves to `true` if the user who sent the message is currently the admin of the current group chat.
		 *
		 * ```js
		 * ctx.isGroupChatAdmin().out;
		 * ```
		 */
		isGroupChatAdmin() {
			this._out = (async () => {
				if (!this.isGroupChat().out) return false;
				const sender = this.userId().out;
				const participants = (await bot.groupMetadata(this.chatId().out)).participants;
				const participant = participants.find((v) => v.id === sender);
				return Boolean(participant?.admin);
			})();
			return this as unknown as Context<Promise<boolean>>;
		}

		/**
		 * Returns true if the user is the owner of bot.
		 *
		 * ```js
		 * ctx.isBotOwner().out;
		 * ```
		 */
		isBotOwner() {
			this._out = this.userId().out === process.env.OWNER_NUMBER + "@s.whatsapp.net";
			return this as unknown as Context<boolean>;
		}

		/**
		 * Returns true if the user is in premium subscription.
		 *
		 * ```js
		 * ctx.isPremiumUser().out;
		 * ```
		 */
		isPremiumUser() {
			this._out = (this.userData().out.premiumUntil || 0) > Date.now();
			return this as unknown as Context<boolean>;
		}
	};
}
export type MessageContext = ReturnType<typeof createMessageContext>["prototype"];

export function createGroupParticipantsUpdateContext(LOCALDB: Types.LOCALDB, bot: ReturnType<typeof makeWASocket>) {
	return class Context<O> {
		private _out: any = undefined;

		constructor(
			/**
			 * Group participants update content.
			 */
			public update: {
				id: string;
				participants: string[];
				action: Baileys.ParticipantAction;
			}
		) {}

		get out(): O {
			return this._out;
		}

		/**
		 * It basically a method to modify the `context.out` value.
		 *
		 * With it you can create a different design pattern, e.g:
		 * ```js
		 * ctx.text().and(o => o.toUpperCase()).and((o, ctx) => ctx.reply({
		 *     text: `You said "${o}" in upper case.`
		 * }));
		 * ```
		 */
		and<_O>(fn: (out: O, thisContext: this) => _O) {
			this._out = fn(this._out, this);
			return this as unknown as Context<_O>;
		}

		/**
		 * The chat id.
		 *
		 * ```js
		 * ctx.chatId().out;
		 * ```
		 */
		chatId() {
			this._out = this.update.id!;
			return this as unknown as Context<string>;
		}

		/**
		 * Data from the bot system. Can be accessed from any chat.
		 *
		 * ```js
		 * ctx.systemData().out;
		 * ```
		 */
		systemData() {
			this._out = LOCALDB.system;
			return this as unknown as Context<Types.SYSTEMDB>;
		}

		/**
		 * Chat data.
		 *
		 * ```js
		 * ctx.chatData().out;
		 * ```
		 */
		chatData() {
			this._out = LOCALDB[this.chatId().out];
			return this as unknown as Context<Types.GROUPDB>;
		}

		/**
		 * The data from each user included in the update.
		 */
		userData() {
			const _userData: { [k: string]: any } = {};
			for (const id in LOCALDB) {
				if (LOCALDB[id].type !== "user") continue;
				if (this.update.participants.includes(id)) _userData[id] = LOCALDB[id];
			}
			this._out = _userData;
			return this as unknown as Context<{ [userId: string]: Types.USERDB }>;
		}

		/**
		 * Language used in the chat (`"id"` or `"en"`). Defaults to `"id"`.
		 *
		 * ```js
		 * ctx.language().out;
		 * ```
		 */
		language() {
			this._out = this.chatData().out.language || "id";
			return this as unknown as Context<"id" | "en">;
		}

		/**
		 * Respond to group participants update.
		 *
		 * ```js
		 * ctx.reply(...);
		 * ctx.reply(...).out; //for obtaining the message update
		 * ```
		 */
		reply(content: Baileys.AnyMessageContent, options: Baileys.MiscMessageGenerationOptions = {}) {
			this._out = bot.sendMessage(this.chatId().out, content, {
				ephemeralExpiration: 86400 * 7,
				...options,
			});
			return this as unknown as Context<Promise<Baileys.WAProto.WebMessageInfo>>;
		}
	};
}
export type GroupParticipantsUpdateContext = ReturnType<typeof createGroupParticipantsUpdateContext>["prototype"];

/* UNUSED */

/* context.ts:467 */
// /**
//  * Object contains the result of NLP processing on the text. Only exists if the message contains text.
//  *
//  * @see - https://npmjs.com/node-nlp
//  */
// 	nlp?: {
// 	intent: `${"None" | `command.${number}` | `intent.${string | number}`}`;
// 	locale: "id" | "en";
// 	entities: {
// 		start: number;
// 		end: number;
// 		len: number;
// 		accuracy: number;
// 		sourceText: string;
// 		utteranceText: string;
// 		entity: string;
// 	}[];
// 	answer?: string;
// };
