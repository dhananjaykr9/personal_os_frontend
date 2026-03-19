/**
 * ORIN Voice Interface
 * Provides a synthesized smooth male voice for system notifications and greetings.
 */

class OrinVoice {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.initVoice();
  }

  private initVoice() {
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // Prefer high-quality smooth male voices
      this.voice = voices.find(v => v.name.includes('Google UK English Female')) ||
        voices.find(v => v.name.includes('Microsoft')) ||
        voices.find(v => v.name.includes('Female')) ||
        voices.find(v => v.lang === 'en-GB' && v.name.includes('Female')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];
    };

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }

  speak(text: string) {
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.pitch = 0.9;
    utterance.rate = 0.95;
    this.synth.speak(utterance);
  }

  // Speak and return a Promise that resolves when speech is done
  speakAndWait(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.synth.speaking) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.pitch = 0.9;
      utterance.rate = 0.95;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve(); // resolve on error too so mic always restarts
      this.synth.speak(utterance);
    });
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  stop() {
    this.synth.cancel();
  }
}

export const orin = new OrinVoice();
