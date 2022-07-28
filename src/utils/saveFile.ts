import * as fs from "fs";

export async function saveFile(data: string | Buffer | import("stream").Transform): Promise<string> {
	const random = randomFileName();
	if (typeof data === "string" || data instanceof Buffer) {
		fs.writeFileSync(random, data);
		return random;
	} else {
		const stream = fs.createWriteStream(random);
		data.pipe(stream);
		return await new Promise((resolve, reject) => {
			data.on("close", () => resolve(random));
			data.on("error", reject);
			stream.on("error", reject);
		});
	}
}

export function randomFileName() {
	return "./tmp/" + Date.now() + "-" + Math.random().toString(36).slice(2).toUpperCase();
}

setInterval(() => {
	const now = Date.now();
	for (const file of fs.readdirSync("./tmp/")) {
		const dateCreated = +file.split("-")[0];
		if (now - dateCreated > 900000) {
			fs.unlinkSync("./tmp/" + file);
		}
	}
}, 60000);
