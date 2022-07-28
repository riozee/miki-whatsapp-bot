// Type definitions for kao.moji ^0.1.3
// Definitions by: riozec https://github.com/riozec

// not a complete one tho, just make it to fit in this project

declare module "kao.moji" {
	class kao {
		static moji: {
			angry: () => string;
			mad: () => string;
			bear: () => string;
			beg: () => string;
			blush: () => string;
			bow: () => string;
			bunny: () => string;
			rabbit: () => string;
			bye: () => string;
			hi: () => string;
			hello: () => string;
			cat: () => string;
			confused: () => string;
			crying: () => string;
			cute: () => string;
			kawaii: () => string;
			dancing: () => string;
			depressed: () => string;
			determined: () => string;
			devil: () => string;
			disappointed: () => string;
			eating: () => string;
			drinking: () => string;
			evil: () => string;
			excited: () => string;
			fall: () => string;
			feminine: () => string;
			flower: () => string;
			funny: () => string;
			glasses: () => string;
			sunglasses: () => string;
			grin: () => string;
			gross: () => string;
			happy: () => string;
			heart: () => string;
			helpless: () => string;
			hide: () => string;
			hit: () => string;
			hug: () => string;
			hurry: () => string;
			kiss: () => string;
			laughing: () => string;
			lennyface: () => string;
			love: () => string;
			magic: () => string;
			middlefinger: () => string;
			monkey: () => string;
			music: () => string;
			nervous: () => string;
			peacesign: () => string;
			poop: () => string;
			roger: () => string;
			roll: () => string;
			running: () => string;
			sad: () => string;
			saliva: () => string;
			salute: () => string;
			scared: () => string;
			shake: () => string;
			sheep: () => string;
			shocked: () => string;
			shrug: () => string;
			shy: () => string;
			embarrassed: () => string;
			sleep: () => string;
			smiling: () => string;
			smug: () => string;
			sparkles: () => string;
			stars: () => string;
			spin: () => string;
			sulk: () => string;
			surprised: () => string;
			sweat: () => string;
			tableflip: () => string;
			thatsit: () => string;
			thumbsup: () => string;
			tired: () => string;
			trymybest: () => string;
			unicode: () => string;
			vomit: () => string;
			weird: () => string;
			wink: () => string;
			available: () => Array<keyof typeof kao["moji"]>;
		};
	}
	export = kao;
}
