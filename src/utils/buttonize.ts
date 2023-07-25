import type * as Baileys from "@whiskeysockets/baileys";
const random = () => Math.floor(Math.random() * 10 ** 6);

type Templatable = {
	templateButtons?: Baileys.proto.IHydratedTemplateButton[];
	footer?: string;
};
type TButtons = Array<
	| string
	| {
			url: string;
			text: string;
	  }
	| {
			call: string;
			text: string;
	  }
	| {
			text: string;
			id: string;
	  }
>;
export function tbtn(buttons: TButtons, footer?: string) {
	if (!buttons.some((v) => typeof v === "string" || "id" in v)) buttons.push("");
	if (!buttons.some((v) => typeof v !== "string" && "call" in v)) buttons.push({ call: "0", text: "" });
	if (!buttons.some((v) => typeof v !== "string" && "url" in v)) buttons.push({ url: "0", text: "" });
	const templateButtons: Templatable["templateButtons"] = [];
	for (const [idx, button] of Object.entries(buttons)) {
		if (typeof button === "string" || "id" in button) {
			templateButtons.push({
				index: +idx,
				quickReplyButton: {
					displayText: typeof button === "string" ? button : button.text,
					id: typeof button === "string" ? `miki-bot-${random()}` : button.id,
				},
			});
		} else if ("url" in button) {
			templateButtons.push({
				index: +idx,
				urlButton: {
					displayText: button.text,
					url: button.url,
				},
			});
		} else if ("call" in button) {
			templateButtons.push({
				index: +idx,
				callButton: {
					displayText: button.text,
					phoneNumber: button.call,
				},
			});
		}
	}
	return {
		templateButtons,
		footer,
	};
}

type Buttonable = {
	buttons?: Baileys.proto.Message.ButtonsMessage.IButton[];
};
type Buttons = Array<string | { text: string; id: string }>;
export function btn(buttons: Buttons) {
	const _buttons: Buttonable["buttons"] = [];
	for (const [idx, button] of Object.entries(buttons)) {
		_buttons.push({
			buttonId: typeof button === "string" ? `miki-bot-${random()}` : button.id,
			buttonText: {
				displayText: typeof button === "string" ? button : button.text,
			},
			type: 1,
		});
	}
	return {
		buttons: _buttons,
	};
}

type Listable = {
	sections?: Baileys.proto.Message.ListMessage.ISection[];
	title?: string;
	buttonText?: string;
};
type item = string | [string, string] | { itemTitle: string; description: string; id?: string };
type section = { sectionTitle: string; items: Array<item> };
type List = {
	buttonText: string;
	listTitle: string;
	listItems: item[] | section[];
};
export function list(list: List, footer?: string) {
	const sections: Listable["sections"] = [];
	const itemsOrSections = list.listItems;
	function isSection(itemsOrSections: List["listItems"]): itemsOrSections is section[] {
		return typeof itemsOrSections[0] === "object" && "sectionTitle" in itemsOrSections[0];
	}
	if (isSection(itemsOrSections)) {
		for (const section of itemsOrSections) {
			const sectionRows: Baileys.proto.Message.ListMessage.IRow[] = [];
			for (const [idx, row] of Object.entries(section.items)) {
				sectionRows.push({
					title: typeof row === "string" ? row : Array.isArray(row) ? row[0] : row.itemTitle,
					description: typeof row === "string" ? "" : Array.isArray(row) ? row[1] : row.description,
					rowId: typeof row === "string" ? `miki-bot-${random()}` : Array.isArray(row) ? `miki-bot-${random()}` : row.id,
				});
			}
			sections.push({
				title: section.sectionTitle,
				rows: sectionRows,
			});
		}
	} else {
		const sectionRows: Baileys.proto.Message.ListMessage.IRow[] = [];
		for (const [idx, item] of Object.entries(itemsOrSections)) {
			sectionRows.push({
				title: typeof item === "string" ? item : Array.isArray(item) ? item[0] : item.itemTitle,
				description: typeof item === "string" ? "" : Array.isArray(item) ? item[1] : item.description,
				rowId: typeof item === "string" ? `miki-bot-${Date.now()}` : Array.isArray(item) ? `miki-bot-${random()}` : item.id,
			});
		}
		sections.push({
			title: "",
			rows: sectionRows,
		});
	}
	return {
		sections,
		footer,
		title: list.listTitle,
		buttonText: list.buttonText,
	};
}
