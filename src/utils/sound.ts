import { sleep } from "./simonReducer";

export const frequencies = {
  yellow: 329.63, // E4
  red: 261.63, // C4
  blue: 220.0, // A3
  green: 164.81, // E3
  gameOver: 110.0, // A2
  success: 523.25, // C5
} as const;

export type Frequence = keyof typeof frequencies

// ==================== AUDIO CONTEXT SINGLETON ====================
// Create a single reusable AudioContext to avoid memory leaks from creating multiple contexts
let audioContextInstance: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContextInstance) {
    audioContextInstance = new window.AudioContext();
  }
  return audioContextInstance;
};

let currentOscillator = null as OscillatorNode | null;
let currentGainNode = null as GainNode | null;

// ==================== HELPER FUNCTIONS ====================
export const playSound = ({
  frequence,
  durationMs = 300,
}: {
  frequence: Frequence;
  durationMs?: number;
}) => {
  // Clean up previous oscillator and gain node to prevent resource leaks
  if (currentOscillator) {
    try {
      currentOscillator.stop();
      currentOscillator.disconnect();
    } catch (_e) {
      // Oscillator may already be stopped, ignore error
    }
  }
  if (currentGainNode) {
    currentGainNode.disconnect();
  }

  const durationSec = durationMs / 1000;

  // Reuse the single AudioContext instead of creating a new one each time
  const audioContext = getAudioContext();
  // Create an oscillator to generate the sound wave
  const oscillator = audioContext.createOscillator();
  // Create a gain node to control volume/amplitude
  const gainNode = audioContext.createGain();
  // Connect oscillator to gain node, then gain node to speakers
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Set the frequency based on which color button was clicked
  oscillator.frequency.value = frequencies[frequence];
  // Use a sine wave for smooth, pure tone
  oscillator.type = "sine";

  // Set initial gain to 0.3 (30% volume) at the start of playback
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  // Fade out the sound exponentially from 0.3 to 0.01 over the specified interval
  gainNode.gain.exponentialRampToValueAtTime(
    0.01, // End volume (nearly silent)
    audioContext.currentTime + durationSec,
  );

  // Start playing the sound immediately
  oscillator.start(audioContext.currentTime);
  // Stop the sound after the interval duration
  oscillator.stop(audioContext.currentTime + durationSec);

  // Store references for cleanup
  currentOscillator = oscillator;
  currentGainNode = gainNode;
};

export const playGameOverSequence = async () => {
  const audioContext = getAudioContext();

  // Create a buzzing sad tone using a low frequency with tremolo effect
  const baseFrequency = 200; // Low frequency for sad/error tone
  const tremoloDuration = 0.6; // Total duration in seconds

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const tremoloOscillator = audioContext.createOscillator(); // For buzzing/tremolo effect

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Connect tremolo oscillator to modulate the gain
  tremoloOscillator.connect(gainNode.gain);

  // Set up base tone
  oscillator.frequency.value = baseFrequency;
  oscillator.type = "sine";

  // Set up tremolo (buzzing effect) - fast oscillation of volume
  tremoloOscillator.frequency.value = 5; // 5Hz buzzing effect
  tremoloOscillator.type = "sine";

  // Create the tremolo envelope (0.1 to 0.3 = buzzing between 10% and 30% volume)
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  tremoloOscillator.start(audioContext.currentTime);

  // Gradually lower the pitch while fading out (sad/descending effect)
  oscillator.frequency.setTargetAtTime(
    baseFrequency * 0.7,
    audioContext.currentTime,
    0.3, // Time constant for exponential decay
  );

  // Fade out over the duration
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + tremoloDuration,
  );

  // Start and stop everything
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + tremoloDuration);
  tremoloOscillator.stop(audioContext.currentTime + tremoloDuration);

  await sleep(1000); // Wait for the sequence to finish
};

export const playSuccessSequence = async () => {
  const audioContext = getAudioContext();

  // Create a buzzing sad tone using a low frequency with tremolo effect
  const baseFrequency = 200; // Low frequency for sad/error tone
  const tremoloDuration = 0.6; // Total duration in seconds

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const tremoloOscillator = audioContext.createOscillator(); // For buzzing/tremolo effect

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Connect tremolo oscillator to modulate the gain
  tremoloOscillator.connect(gainNode.gain);

  // Set up base tone
  oscillator.frequency.value = baseFrequency;
  oscillator.type = "sine";

  // Set up tremolo (buzzing effect) - fast oscillation of volume
  tremoloOscillator.frequency.value = 5; // 5Hz buzzing effect
  tremoloOscillator.type = "sine";

  // Create the tremolo envelope (0.1 to 0.3 = buzzing between 10% and 30% volume)
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  tremoloOscillator.start(audioContext.currentTime);

  // Gradually lower the pitch while fading out (sad/descending effect)
  oscillator.frequency.setTargetAtTime(
    baseFrequency * 0.7,
    audioContext.currentTime,
    0.3, // Time constant for exponential decay
  );

  // Fade out over the duration
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + tremoloDuration,
  );

  // Start and stop everything
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + tremoloDuration);
  tremoloOscillator.stop(audioContext.currentTime + tremoloDuration);

  await sleep(1000); // Wait for the sequence to finish
};
