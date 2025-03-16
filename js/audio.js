class MorseAudio {
	constructor() {
		this.audioContext = null;
		this.gainNode = null;
		this.activeOscillator = null;
		this.isInitialized = false;
	}

	async init() {
		try {
			this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
			this.gainNode = this.audioContext.createGain();
			this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
			this.gainNode.connect(this.audioContext.destination);
			this.isInitialized = true;
		} catch (error) {
			console.error("Failed to initialize audio:", error);
			throw error;
		}
	}

	startTone() {
		if (!this.isInitialized) return;

		// Stop any existing tone
		this.stopTone();

		try {
			this.activeOscillator = this.audioContext.createOscillator();
			this.activeOscillator.type = "sine";
			this.activeOscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
			this.activeOscillator.connect(this.gainNode);
			this.activeOscillator.start();
		} catch (error) {
			console.error("Failed to start tone:", error);
			throw error;
		}
	}

	stopTone() {
		if (this.activeOscillator) {
			try {
				this.activeOscillator.stop();
				this.activeOscillator.disconnect();
			} catch (error) {
				// Ignore errors from already stopped oscillators
			}
			this.activeOscillator = null;
		}
	}

	playMorseSound(type) {
		if (!this.isInitialized) return;

		const oscillator = this.audioContext.createOscillator();
		oscillator.type = "sine";
		oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
		oscillator.connect(this.gainNode);

		const duration = type === "." ? 0.15 : 0.45;

		oscillator.start();
		oscillator.stop(this.audioContext.currentTime + duration);
	}
}

export default MorseAudio;
