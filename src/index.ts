import "dotenv/config";
import path from "path";
import * as fs from "fs";
import axios from "axios";
import Promptees from "promptees";
import * as fsp from "fs/promises";
import makeWASocket, * as Baileys from '@whiskeysockets/baileys';
import { MessageContext, createMessageContext, GroupParticipantsUpdateContext, createGroupParticipantsUpdateContext } from "./utils";

import type * as Types from "./utils/typings/types";

(async () => {
	// create a file to store data
	if (!fs.existsSync("./data/")) fs.mkdirSync("./data/");
	if (!fs.existsSync("./tmp/")) fs.mkdirSync("./tmp/");
	if (!fs.existsSync("./res/")) fs.mkdirSync("./res/");
	if (!fs.existsSync("./data/db.json")) fs.writeFileSync("./data/db.json", "{}");
	const LOCALDB: Types.LOCALDB = JSON.parse(fs.readFileSync("./data/db.json").toString());
	// save every minute
	setInterval(() => fsp.writeFile("./data/db.json", JSON.stringify(((LOCALDB.system.backupTime = Date.now()), LOCALDB))), 60000);

	if (!LOCALDB.system) LOCALDB.system = { type: "system", backupTime: Date.now() };

	// load all commands and intents
	const { command, basicTexts } = await import("./utils");
	async function recursiveImport(dir: string) {
		for (const file of fs.readdirSync(dir)) {
			const _path = path.join(dir, file);
			if (_path.endsWith(".js")) await import(_path);
			else if (fs.statSync(_path).isDirectory()) recursiveImport(_path);
		}
	}
	await recursiveImport(path.join(__dirname, "./commands"));
	for (const { onStart } of command.listOfCommands) {
		onStart?.(LOCALDB, command.listOfCommands);
	}
	console.log(command.listOfCommands.length, "commands loaded.");

	// my lib: https://npmjs.com/promptees
	const promptees = new Promptees<MessageContext, "timeout">({
		// Sets the default command wait time to 15 minutes.
		timeout: 1000 * 60 * 15,
		onTimeout: () => "timeout",
	});

	// WhatsApp connection
	(async function connectToWhatsApp() {
		const { state, saveCreds } = await Baileys.useMultiFileAuthState("./data/session");
		const messageStore: { [key: string]: Baileys.WAProto.IMessage } = {};
		const messageQueue: (() => Promise<void>)[] = [];

		// send up to 10 messages per second (avoid ban)
		let queueIntervalId: NodeJS.Timeout;
		(function sendQueue() {
			if (messageQueue.length) {
				const msgToBeSent = messageQueue.splice(0, 2);
				for (const msg of msgToBeSent) {
					msg();
				}
			}
			const interval = messageQueue.length ? Math.floor(Math.random() * 100) + 100 : 1000;
			queueIntervalId = setTimeout(sendQueue, interval);
		})();

		// initialize WA connection
		const bot = makeWASocket({
			printQRInTerminal: true,
			browser: Baileys.Browsers.appropriate("Miki"),
			version: (await Baileys.fetchLatestBaileysVersion()).version,
			auth: state,
			getMessage: async (key) => (key.id ? messageStore[key.id] : undefined),
			patchMessageBeforeSending: (message) => {
                if (message.buttonsMessage || message.templateMessage || message.listMessage) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {},
                                },
                                ...message,
                            },
                        },
                    };
                }
				return message;
            },
		});

		// overwrite sendMessage so it can save and push messages
		const oldSendMessage = bot.sendMessage;
		bot.sendMessage = async function (...args) {
			return await new Promise((resolve, reject) => {
				// queue message to be sent
				messageQueue.push(async () => {
					try {
						const sent = await oldSendMessage.call(this, ...args);
						if (!sent) return resolve(sent);
						// save message temporarily
						messageStore[sent.key.id!] = sent.message!;
						// delete after 15 seconds
						setTimeout((id: string) => delete messageStore[id], 15000, `${sent.key.id}`);
						return resolve(sent);
					} catch (e) {
						return reject(e);
					}
				});
			});
		};

		// connection handler
		bot.ev.on("connection.update", (update) => {
			const { connection, lastDisconnect } = update;
			if (connection === "close") {
				console.error("Disconnected from WhatsApp");
				for (const { onDisconnected } of command.listOfCommands) {
					onDisconnected?.(bot);
				}
				// @ts-ignore
				if (lastDisconnect?.error?.output?.statusCode !== Baileys.DisconnectReason.loggedOut) {
					clearTimeout(queueIntervalId);
					connectToWhatsApp(); //reconnect
				} else {
					console.error("Logged out from WhatsApp");
					console.error("Removing old session");
					fs.rmSync("./data/session", { recursive: true, force: true });
					connectToWhatsApp(); //reconnect
				}
			} else if (connection === "connecting") {
				console.log("Connecting to WhatsApp");
			} else if (connection === "open") {
				console.log("Connected to WhatsApp");
				for (const { onConnected } of command.listOfCommands) {
					onConnected?.(bot);
				}
			}
		});

		// session credentials handler
		bot.ev.on("creds.update", () => saveCreds());

		const MessageContext = createMessageContext(LOCALDB, bot, promptees);

		// message handler
		bot.ev.on("messages.upsert", async (update) => {
			try {
				if (update.type !== "notify") return;
				const m = update.messages[0];
				if (!m.message) return;
				if (m.key?.fromMe) return;
				if (m.key?.id?.length === 16 && m.key.id.startsWith("BAE5")) return; // message from other Baileys bot
				if (m.key?.remoteJid === "status@broadcast") return;
				if (m.message.protocolMessage) return;
				if (m.message.reactionMessage) return;
				if (m.message.pollUpdateMessage) return;
				if (m.message.ephemeralMessage) {
					m.message = m.message.ephemeralMessage.message!;
				} else if (m.message.viewOnceMessage) {
					m.message = m.message.viewOnceMessage.message!;
				}

				const now = Date.now();
				const context = new MessageContext(m);
				const user_id = context.userId().out;
				const chat_id = context.chatId().out;

				// check if either user or chat is listed in banned list, and return immediately if do exists
				if (LOCALDB.system.banneds?.some((id: string) => id === user_id || id === chat_id)) return;

				if (!LOCALDB[user_id]) {
					LOCALDB[user_id] = {
						type: "user",
						language: "id",
						stats: {
							joined: now,
							lastSeen: now,
							hits: {},
						},
					};
				}
				if (chat_id !== user_id) {
					if (!LOCALDB[chat_id]) {
						LOCALDB[chat_id] = {
							type: "group",
							language: "id",
						};
					}
				}

				const id = user_id + chat_id;
				const cmdName = context.command().out;
				const language = context.language().out;
				const user_data = context.userData().out;
				const chat_data = context.chatData().out;
				const isBotOwner = context.isBotOwner().out;
				const isGroupChat = context.isGroupChat().out;
				const isPrompting = promptees.isPrompting(id);
				const isPremiumUser = context.isPremiumUser().out;
				const TEXTS = basicTexts[language];
				let _isGroupChatAdmin: boolean | null = null;
				const isGroupChatAdmin = async () => _isGroupChatAdmin ?? (_isGroupChatAdmin = await context.isGroupChatAdmin().out);

				user_data.stats.lastSeen = now;

				console.log(
					[
						">",
						new Date(now).toLocaleTimeString(),
						"~" + user_id.replace(/\D+/g, ""),
						isGroupChat ? "@" + chat_id : "",
						context.msgType().out,
						context.text().out?.slice(0, 250) || "-",
					]
						.filter(Boolean)
						.join(" ")
				);
				console.dir(context.update, { depth: null });

				if (!chat_data.muted) {
					for (const { onMessage } of command.listOfCommands) {
						onMessage?.(context, bot);
					}
				}

				// if the bot is waiting for a response from the user, return it
				if (isPrompting) return promptees.returnPrompt(id, context);

				// if the user sends a command
				if (cmdName) {
					// if the chat is muted, don't run commands except 'sleep' command.
					if (chat_data.muted && cmdName !== "sleep") return;
					// if the group is set to admin only who can run commands
					if (isGroupChat && chat_data.adminonly && !(await isGroupChatAdmin())) return;
					// find command
					const theCommand = command.listOfCommands.find((v) => v.metadata.command.includes(cmdName));
					if (!theCommand) {
						if (isGroupChat) return;
						else {
							return context.react("🤷‍♀️").reply({
								text: TEXTS.CMD_NOT_FOUND(),
							});
						}
					}
					// anti spam
					if (user_data.stats.lastHit) {
						const cooldownTime = (user_data.premiumUntil || 0) > now ? 250 : 2000;
						if (now - user_data.stats.lastHit < cooldownTime) {
							return context.react("✋").reply({ text: TEXTS.SPAM(cooldownTime === 250 ? 0.25 : 2) });
						}
					}
					user_data.stats.lastHit = now;
					// permission
					switch (theCommand.metadata.permission) {
						case "all":
							break;
						case "all-owner":
							if (!isBotOwner) return context.react("❌").reply({ text: TEXTS.NOT_OWNER() });
							break;
						case "group-admin":
							if (!isGroupChat) return context.react("❌").reply({ text: TEXTS.NOT_GROUP() });
							if (!(await isGroupChatAdmin())) return context.react("❌").reply({ text: TEXTS.NOT_ADMIN() });
							break;
						case "group-all":
							if (!isGroupChat) return context.react("❌").reply({ text: TEXTS.NOT_GROUP() });
							break;
						case "group-owner":
							if (!isBotOwner) return context.react("❌").reply({ text: TEXTS.NOT_OWNER() });
							if (!isGroupChat) return context.react("❌").reply({ text: TEXTS.NOT_GROUP() });
							break;
						case "private-all":
							if (isGroupChat) return context.react("❌").reply({ text: TEXTS.NOT_PRIVATE() });
							break;
						case "private-owner":
							if (!isBotOwner) return context.react("❌").reply({ text: TEXTS.NOT_OWNER() });
							if (isGroupChat) return context.react("❌").reply({ text: TEXTS.NOT_PRIVATE() });
							break;
						case "private-admin":
							if (isGroupChat && !(await isGroupChatAdmin())) return context.react("❌").reply({ text: TEXTS.NOT_PRIVATE_ADMIN() });
					}
					// limit premium command to a non-premium user for once every 24h
					const lastPremCmdDiff = now - (user_data.lastPremCmd || 0);
					if (theCommand.metadata.premium && !isPremiumUser && lastPremCmdDiff < 86_400_000) {
						const time = (a: number, b: number) => Math.floor((now - lastPremCmdDiff) / a) % b;
						return context
							.react("💲")
							.reply({ text: TEXTS.PREMIUM_LIMIT(`${time(3_600_000, 1)}:${time(60_000, 60)}:${time(1_000, 60)}`) });
					}
					// send description if first time
					if (!user_data.stats.hits[cmdName]) {
						context.reply({
							text: TEXTS.FIRSTTIME_CMD_DESC(cmdName, theCommand.metadata.locale.description[language], theCommand.metadata.premium || false),
						});
					}
					// finally run the command
					try {
						await theCommand.onCommand(context, bot);
						user_data.stats.hits[cmdName] ??= 0;
						user_data.stats.hits[cmdName] += 1;
						if (theCommand.metadata.premium) user_data.lastPremCmd = now;
						return context.react("✅");
					} catch (e) {
						console.error(e);
						context.react("❌").reply({ text: TEXTS.ERROR() });
						const dest = process.env.ERROR_REPORT_NUMBER || process.env.OWNER_NUMBER;
						bot.sendMessage(
							dest?.endsWith("@g.us") ? dest : dest + "@s.whatsapp.net",
							{
								text: `Error at *${cmdName}*:\n\t${(e as Error)?.stack || e}`,
							},
							{ quoted: context.update, ephemeralExpiration: 86400 }
						);
					}
				}
			} catch (error) {
				console.error(error);
			}
		});

		const GroupParticipantsUpdateContext = createGroupParticipantsUpdateContext(LOCALDB, bot);

		// group participants update handler
		bot.ev.on("group-participants.update", (update) => {
			const groupParticipantsUpdateContext = new GroupParticipantsUpdateContext(update);

			if (!groupParticipantsUpdateContext.chatData().out.muted) {
				for (const { onGroupParticipantsUpdate } of command.listOfCommands) {
					onGroupParticipantsUpdate?.(groupParticipantsUpdateContext, bot);
				}
			}
		});
	})();
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
