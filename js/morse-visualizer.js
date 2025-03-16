const COLORS = {
	BLACK: "#000000",
	DARK: "#181C14",
	LIGHT: "#303828",
	HIGHLIGHT_OUTER: "#FCA311",
	HIGHLIGHT_INNER: "#FDC05D",
};

class MorseVisualizer {
	constructor() {
		this.svgContainer = document.getElementById("svg-container");
		this.morseToLetter = {
			".-": "A",
			"-...": "B",
			"-.-.": "C",
			"-..": "D",
			".": "E",
			"..-.": "F",
			"--.": "G",
			"....": "H",
			"..": "I",
			".---": "J",
			"-.-": "K",
			".-..": "L",
			"--": "M",
			"-.": "N",
			"---": "O",
			".--.": "P",
			"--.-": "Q",
			".-.": "R",
			"...": "S",
			"-": "T",
			"..-": "U",
			"...-": "V",
			".--": "W",
			"-..-": "X",
			"-.--": "Y",
			"--..": "Z",
		};
	}

	async init() {
		try {
			const response = await fetch("morse_code.svg");
			const svgData = await response.text();
			this.svgContainer.innerHTML = svgData;
			this.setupGradients();
			this.resetColors();
		} catch (error) {
			console.error("Failed to load SVG:", error);
			throw error;
		}
	}

	setupGradients() {
		const svg = document.querySelector("svg");
		if (!document.getElementById("radialGradient")) {
			const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

			// Normal gradient
			const gradient = this.createGradient("radialGradient", COLORS.LIGHT, COLORS.DARK);

			// Highlight gradient
			const highlightGradient = this.createGradient(
				"highlightGradient",
				COLORS.HIGHLIGHT_INNER,
				COLORS.HIGHLIGHT_OUTER
			);

			defs.appendChild(gradient);
			defs.appendChild(highlightGradient);
			svg.insertBefore(defs, svg.firstChild);
		}
	}

	createGradient(id, innerColor, outerColor) {
		const gradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
		gradient.setAttribute("id", id);

		const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
		stop1.setAttribute("offset", "0%");
		stop1.setAttribute("stop-color", innerColor);

		const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
		stop2.setAttribute("offset", "100%");
		stop2.setAttribute("stop-color", outerColor);

		gradient.appendChild(stop1);
		gradient.appendChild(stop2);

		return gradient;
	}

	startNode() {
		const startpath = document.getElementById("startpath");
		const startnode = document.getElementById("startnode");

		if (startpath) startpath.style.stroke = "url(#highlightGradient)";
		if (startnode) startnode.style.stroke = COLORS.HIGHLIGHT_OUTER;
	}

	highlightPath(sequence) {
		const letter = this.morseToLetter[sequence];
		if (!letter) return;

		const pathId = `to-${letter}`;
		const nodeId = `im-${letter}`;
		const textId = `im-text-${letter}`;

		const path = document.getElementById(pathId);
		const node = document.getElementById(nodeId);
		const text = document.getElementById(textId);

		if (path) path.style.stroke = "url(#highlightGradient)";
		if (node) {
			node.style.stroke = COLORS.HIGHLIGHT_OUTER;
			node.style.fill = "url(#highlightGradient)";
		}
		if (text) {
			text.style.fill = COLORS.HIGHLIGHT_OUTER;
		}
	}

	resetColors() {
		const elements = {
			lines: "line, path",
			shapes: "circle, rect, ellipse",
			text: "text",
		};

		for (const [type, selector] of Object.entries(elements)) {
			const elements = document.querySelectorAll(selector);
			elements.forEach((element) => {
				if (type == "text") {
					element.style.fill = COLORS.BLACK;
				} else {
					element.style.stroke = COLORS.BLACK;
					element.style.fill = "url(#radialGradient)";
				}
			});
		}
	}

	getLetter(sequence) {
		return this.morseToLetter[sequence] || "?";
	}
}

export default MorseVisualizer;
