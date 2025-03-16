import MorseAudio from "./audio.js";
import MorseVisualizer from "./morse-visualizer.js";

class MorseApp {
	constructor() {
		this.audio = new MorseAudio();
		this.visualizer = new MorseVisualizer();
		this.settings = {
			dotDuration: 50,
			intervalDuration: 1000,
		};

		this.state = {
			tapStart: 0,
			morseSequence: "",
			timeout: null,
			isSpacebarPressed: false,
			isPressed: false,
		};

		this.elements = {
			tapButton: document.getElementById("tap-button"),
			clearButton: document.getElementById("clear-button"),
			textOutput: document.getElementById("text-output"),
			settingsIcon: document.getElementById("settings-icon"),
			settingsModal: document.getElementById("settings-modal"),
			dotDurationInput: document.getElementById("dot-duration"),
			intervalDurationInput: document.getElementById("interval-duration"),
			dotDurationValue: document.getElementById("dot-duration-value"),
			intervalDurationValue: document.getElementById("interval-duration-value"),
			saveButton: document.querySelector(".save-button"),
			cancelButton: document.querySelector(".cancel-button"),
		};

		this.bindEvents();
	}

	async init() {
		try {
			await Promise.all([this.audio.init(), this.visualizer.init()]);
			this.loadSettings();
			this.updateSettingsDisplay();
		} catch (error) {
			console.error("Failed to initialize app:", error);
			this.showError("Failed to initialize the application. Please refresh the page.");
		}
	}

	bindEvents() {
		// Touch events for tap button
		this.elements.tapButton.addEventListener("touchstart", (e) => {
			e.preventDefault();
			if (e.touches.length === 1) {
				this.handlePress();
			}
		});

		this.elements.tapButton.addEventListener("touchend", (e) => {
			e.preventDefault();
			if (this.state.isPressed) {
				this.handleRelease();
			}
		});

		this.elements.tapButton.addEventListener("touchcancel", (e) => {
			e.preventDefault();
			if (this.state.isPressed) {
				this.handleRelease();
			}
		});

		// Mouse events for tap button
		let isTouch = false;
		this.elements.tapButton.addEventListener("mousedown", () => {
			if (!isTouch) {
				this.handlePress();
			}
		});

		this.elements.tapButton.addEventListener("mouseup", () => {
			if (!isTouch && this.state.isPressed) {
				this.handleRelease();
			}
		});

		// Track touch vs mouse
		this.elements.tapButton.addEventListener(
			"touchstart",
			() => {
				isTouch = true;
			},
			{passive: true}
		);

		this.elements.tapButton.addEventListener(
			"touchend",
			() => {
				setTimeout(() => {
					isTouch = false;
				}, 250);
			},
			{passive: true}
		);

		// Keyboard events
		document.addEventListener("keydown", (e) => {
			if (e.code === "Space" && !e.repeat && !this.state.isSpacebarPressed) {
				e.preventDefault();
				this.state.isSpacebarPressed = true;
				this.handlePress();
			}
		});

		document.addEventListener("keyup", (e) => {
			if (e.code === "Space") {
				e.preventDefault();
				this.state.isSpacebarPressed = false;
				this.handleRelease();
			}
		});

		// Clear button
		this.elements.clearButton.addEventListener("click", () => {
			// if the morse sequence is not completed, return
			if (this.state.morseSequence) {
				return;
			}
			this.elements.textOutput.innerHTML = "";
			this.visualizer.resetColors();
		});

		// Settings events
		this.elements.settingsIcon.addEventListener("click", () => this.openSettings());
		this.elements.saveButton.addEventListener("click", () => this.saveSettings());
		this.elements.cancelButton.addEventListener("click", () => this.closeSettings());
		this.elements.settingsModal.addEventListener("click", (e) => {
			if (e.target === this.elements.settingsModal) {
				this.closeSettings();
			}
		});

		// Settings input events
		this.elements.dotDurationInput.addEventListener("input", () => {
			this.elements.dotDurationValue.textContent = `${this.elements.dotDurationInput.value}ms`;
		});

		this.elements.intervalDurationInput.addEventListener("input", () => {
			this.elements.intervalDurationValue.textContent = `${this.elements.intervalDurationInput.value}ms`;
		});
	}

	handlePress() {
		if (this.state.isPressed) return;
		this.state.isPressed = true;
		this.state.tapStart = Date.now();
		this.audio.startTone();
	}

	handleRelease() {
		if (!this.state.isPressed) return;
		this.state.isPressed = false;

		const tapDuration = Date.now() - this.state.tapStart;
		const signal = tapDuration < this.settings.dotDuration * 3 ? "." : "-";
		this.state.morseSequence += signal;

		this.audio.stopTone();
		this.visualizer.highlightPath(this.state.morseSequence);
		this.visualizer.startNode();

		if (this.state.timeout) clearTimeout(this.state.timeout);

		this.state.timeout = setTimeout(() => {
			const letter = this.visualizer.getLetter(this.state.morseSequence);
			this.elements.textOutput.innerHTML += letter + " ";
			this.state.morseSequence = "";
			this.visualizer.resetColors();
		}, this.settings.intervalDuration);
	}

	openSettings() {
		this.elements.settingsModal.classList.add("modal-open");
	}

	closeSettings() {
		this.elements.settingsModal.classList.remove("modal-open");
	}

	saveSettings() {
		this.settings.dotDuration = parseInt(this.elements.dotDurationInput.value);
		this.settings.intervalDuration = parseInt(this.elements.intervalDurationInput.value);
		this.saveSettingsToStorage();
		this.closeSettings();
	}

	loadSettings() {
		try {
			const savedSettings = localStorage.getItem("morseSettings");
			if (savedSettings) {
				this.settings = {...this.settings, ...JSON.parse(savedSettings)};
			}
		} catch (error) {
			console.error("Failed to load settings:", error);
		}
	}

	saveSettingsToStorage() {
		try {
			localStorage.setItem("morseSettings", JSON.stringify(this.settings));
		} catch (error) {
			console.error("Failed to save settings:", error);
		}
	}

	updateSettingsDisplay() {
		this.elements.dotDurationInput.value = this.settings.dotDuration;
		this.elements.intervalDurationInput.value = this.settings.intervalDuration;
		this.elements.dotDurationValue.textContent = `${this.settings.dotDuration}ms`;
		this.elements.intervalDurationValue.textContent = `${this.settings.intervalDuration}ms`;
	}

	showError(message) {
		const errorDiv = document.createElement("div");
		errorDiv.className = "error";
		errorDiv.textContent = message;
		document.body.insertBefore(errorDiv, document.body.firstChild);
	}
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
	const app = new MorseApp();
	app.init().catch((error) => {
		console.error("Failed to start application:", error);
	});
});
