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
