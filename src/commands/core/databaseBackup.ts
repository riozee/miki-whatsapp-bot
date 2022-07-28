import * as fs from "fs";
import { command } from "../../utils";
import { LOCALDB } from "../../utils/typings/types";

let LOCALDB: LOCALDB;
let intervalId: NodeJS.Timeout;

command.new({
	onStart: (DB) => (LOCALDB = DB),
	onConnected: (bot) => {
		if (!process.env.DATABASE_BACKUP_NUMBER) return console.warn("WARNING: no database backup number.");
		intervalId = setInterval(() => {
			bot.sendMessage(
				process.env.DATABASE_BACKUP_NUMBER?.endsWith("@g.us") ? process.env.DATABASE_BACKUP_NUMBER : process.env.DATABASE_BACKUP_NUMBER + "@s.whatsapp.net",
				{
					document: fs.readFileSync("./data/db.json"),
					mimetype: "application/json",
					fileName: `MIKIBACKUP_${Date.now()}.json`,
				},
				{
					ephemeralExpiration: 86400 * 7,
				}
			);
		}, 60000);
	},
	onDisconnected: (bot) => {
		clearInterval(intervalId);
	},
	onCommand: (context) => {
		context.reply({
			document: fs.readFileSync("./data/db.json"),
			mimetype: "application/json",
			fileName: `MIKIBACKUP_${Date.now()}.json`,
		});
	},
	metadata: {
		__filename,
		category: "owner",
		command: ["getbackup"],
		permission: "all-owner",
		locale: {
			description: {
				id: "[TODO] getbackup description",
				en: "[TODO] getbackup description",
			},
		},
	},
});
