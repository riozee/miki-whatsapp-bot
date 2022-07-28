import type * as Baileys from "@adiwajshing/baileys";
import type { MessageContext, GroupParticipantsUpdateContext } from "..";

export type LOCALDB = { [key: string]: GROUPDB | USERDB | SYSTEMDB };

export type GROUPDB = {
	type: "group";
	language: "id" | "en";
	adminonly?: boolean;
	muted?: boolean;
	[key: string]: any;
};

export type USERDB = {
	type: "user";
	language: "id" | "en";
	premiumUntil?: number;
	lastPremCmd?: number;
	stats: {
		joined: number;
		lastSeen: number;
		hits: {
			[command: string]: number;
		};
		lastHit?: number;
	};
	[key: string]: any;
};

export type SYSTEMDB = {
	type: "system";
	backupTime: number;
	banneds?: string[];
};

export type commandConfigurations = {
	/**
	 * Function that is executed immediately and only once when the command is loaded. Useful for preparing the database because there is access to the database.
	 */
	onStart?: (DB: LOCALDB, listOfCommands: commandConfigurations[]) => any;
	/**
	 * Executed when connected to WhatsApp. Indicated when console is showing `"Connected to WhatsApp"`.
	 */
	onConnected?: (bot: Baileys.WASocket) => any;
	/**
	 * Executed when disconnected from WhatsApp. Indicated when console is showing `"Disconnected from WhatsApp"`.
	 */
	onDisconnected?: (bot: Baileys.WASocket) => any;
	/**
	 * Function that is executed every time a message is received.
	 */
	onMessage?: (context: Omit<MessageContext, "nlp">, bot: Baileys.WASocket) => any;
	/**
	 * Function that is executed when the user gives this command.
	 */
	onCommand: (context: MessageContext, bot: Baileys.WASocket) => any;
	/**
	 * Function that is executed when an update occurs to group members, such as add, kick, promote or demote.
	 */
	onGroupParticipantsUpdate?: (context: GroupParticipantsUpdateContext, bot: Baileys.WASocket) => any;
	/**
	 * Object contains the configuration and information of this command.
	 */
	metadata: {
		/**
		 * Necessary for reloading.
		 */
		__filename: string;
		/**
		 * Contains the names of the commands that the user can type to run this command. Case-insensitive.
		 */
		command: string[];
		/**
		 * Specifies where and who can execute this command.
		 *
		 * Options:
		 * - `"all"` - Anyone in anywhere.
		 * - `"all-owner"` - Anywhere but only the owner.
		 * - `"private-all"` - Anyone but only in private chat.
		 * - `"private-owner"` - Only owner and only in private chat.
		 * - `"private-admin"` - If in group chat then only admin else anyone.
		 * - `"group-all"` - Anyone but only in group chat.
		 * - `"group-owner"` - Only owner and only in group chat.
		 * - `"group-admin"` - Only the admin of group chat.
		 */
		permission: "all" | "all-owner" | `private-${"all" | "owner" | "admin"}` | `group-${"all" | "owner" | "admin"}`;
		/**
		 * Specifies if this command is only for premium users.
		 */
		premium?: true;
		/**
		 * Command category.
		 */
		category: "mediatools" | "othertools" | "games" | "randomfun" | "grouptools" | "botsettings" | "owner";
		/**
		 * Command description.
		 */
		locale: {
			/**
			 * Long description. Shown when first time using the command.
			 */
			description: {
				/**
				 * Bahasa Indonesia
				 */
				id: string;
				/**
				 * English
				 */
				en: string;
			};
			/**
			 * Short name. Shown in menu list.
			 */
			name?: {
				/**
				 * Bahasa Indonesia
				 */
				id?: string;
				/**
				 * English
				 */
				en?: string;
			};
		};
	};
};

/* UNUSED */

/* this file at commandConfigurations["metadata"]["nlp"] */
// /**
//  * Contains the NLP configuration of this command.
//  */
// nlp?: {
// 	/**
// 	 * Contains sentences used by the NLP algorithm to learn in order to understand text from users that do not start with a slash (/).
// 	 *
// 	 * Use brackets `[ ]` and bars `|` to create a pattern. Example:
// 	 *
// 	 * `"I [want to|wanna] eat [a bread|breads]"`
// 	 *
// 	 * This will create:
// 	 * ```
// 	 * - I want to eat a bread
// 	 * - I wanna eat a bread
// 	 * - I want to eat breads
// 	 * - I wanna eat breads
// 	 * ```
// 	 */
// 	utterances: {
// 		/**
// 		 * Bahasa Indonesia
// 		 */
// 		id: string[];
// 		/**
// 		 * English
// 		 */
// 		en: string[];
// 	};
// };

/* this file */
// export type intentConfigurations = {
// 	/**
// 	 * Necessary for reloading.
// 	 */
// 	__filename: string;
// 	/**
// 	 * Name of the intent.
// 	 */
// 	intent?: string;
// 	/**
// 	 * Contains sentences used by the NLP algorithm to learn in order to understand text from users.
// 	 *
// 	 * Use brackets `[ ]` and bars `|` to create a pattern. Example:
// 	 *
// 	 * `"I [want to|wanna] eat [a bread|breads]"`
// 	 *
// 	 * This will create:
// 	 * ```
// 	 * - I want to eat a bread
// 	 * - I wanna eat a bread
// 	 * - I want to eat breads
// 	 * - I wanna eat breads
// 	 * ```
// 	 */
// 	utterances: {
// 		/**
// 		 * Bahasa Indonesia
// 		 */
// 		id: string[];
// 		/**
// 		 * English
// 		 */
// 		en: string[];
// 	};
// 	/**
// 	 * Contains answers that will be selected randomly.
// 	 */
// 	answers?: {
// 		/**
// 		 * Bahasa Indonesia
// 		 */
// 		id: string[];
// 		/**
// 		 * English
// 		 */
// 		en: string[];
// 	};
// };

/* src/utils/intent.ts */
// import type * as Types from "./typings/types";
//
// export const intent = new (class Intents {
// 	listOfIntents: Types.intentConfigurations[] = [];
//
// 	new(configurations: Types.intentConfigurations) {
// 		this.listOfIntents.push(configurations);
// 	}
// })();

/* src/utils/index.ts:7 */
// export { intent } from "./intents";

/* src/index.ts:10 */
// const { NlpManager } = require("node-nlp");
// const { composeFromPattern } = require("@nlpjs/utils");

/* src/index.ts:70 */
// // train the NLP model
// //// Warning: node-nlp module doesn't have a typescript type definitions
// const nlp = new NlpManager({ languages: ["en", "id"], nlu: { log: false }, forceNER: true, calculateSentiment: false });
// for (const [idx, cmd] of Object.entries(command.listOfCommands)) {
// 	const { metadata } = cmd;
// 	const intentName = `command.${idx}`;
// 	if (metadata.nlp) {
// 		metadata.nlp.utterances.id.forEach((text) => composeFromPattern(text).forEach((text: string) => nlp.addDocument("id", text, intentName)));
// 		metadata.nlp.utterances.en.forEach((text) => composeFromPattern(text).forEach((text: string) => nlp.addDocument("en", text, intentName)));
// 	}
// }
// for (const [idx, int] of Object.entries(intent.listOfIntents)) {
// 	const { intent: _intent, utterances, answers } = int;
// 	const intentName = `intent.${_intent || idx}`;
// 	utterances.id.forEach((text) => composeFromPattern(text).forEach((text: string) => nlp.addDocument("id", text, intentName)));
// 	utterances.en.forEach((text) => composeFromPattern(text).forEach((text: string) => nlp.addDocument("en", text, intentName)));
// 	if (answers) {
// 		answers.id.forEach((text) => nlp.addAnswer("id", intentName, text));
// 		answers.en.forEach((text) => nlp.addAnswer("en", intentName, text));
// 	}
// }
// await nlp.train();
// console.log("NLP model trained");

/* src/index.ts:344 */
// // process text using NLP
// // limit to first 150 characters for performance
// // disable the NLP processing if the chat is muted
// const nlpResult = chat_data.muted ? {} : await nlp.process(text.slice(0, 150));
// console.dir(nlpResult, { depth: null });
// if (!chat_data.muted) {
// 	context.nlp = {
// 		intent: nlpResult.intent,
// 		locale: nlpResult.localeIso2,
// 		entities: nlpResult.entities,
// 		answer: nlpResult.answer,
// 	};
// }

/* src/index.ts:347 */
// // stop here if the chat is muted
// if (chat_data.muted) return;
//
// // if NLP can't understand the text...
// if (nlpResult.intent === "None") {
// 	return context.reply({
// 		text: TEXTS.INT_NOT_FOUND(),
// 		...btn(["/feedback"]),
// 	});
// }
//
// // if NLP can understand the text and finds a matched command
// if (/^command\.\d+$/.test(nlpResult.intent)) {
// 	// if the group is set to admin only who can run commands
// 	if (isGroupChat && chat_data.adminonly && !isGroupChatAdmin) return;
// 	const cmdIdx = +nlpResult.intent.slice(8);
// 	const found = await runCommand(cmdIdx);
// 	if (!found) {
// 		return context.react("🤷‍♀️").reply({
// 			text: TEXTS.INT_NOT_FOUND(),
// 			...btn(["/feedback"]),
// 		});
// 	}
// 	return context.react("✅");
// }
//
// // or if NLP can understand it and knows the answer...
// if (nlpResult.answer) return context.reply({ text: nlpResult.answer });

/* src/intents/wannaeat.ts */
// import { intent } from "../utils";
//
// intent.new({
// 	__filename,
// 	utterances: {
// 		id: ["[pengen|ingin|mau] makan [|nih]", "[laper|lapar] [|banget|sekali] [|nih]"],
// 		en: ["[i'm|i am] [|so] hungry", "i [wanna|want to] eat"],
// 	},
// 	answers: {
// 		id: ["Gimana kalau mie ayam?", "Ya makan dong, hehe", "Nasi goreng enak"],
// 		en: ["Go eat something", "How about sushi?", "Mmmm yummy :d"],
// 	},
// });
