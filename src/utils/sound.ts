// ==================== FREQUENCY OBJECTS ====================
const FREQUENCIES = {
  YELLOW: 329.63, // E4
  RED: 261.63, // C4
  BLUE: 220.0, // A3
  GREEN: 164.81, // E3
  GAME_OVER: 200, // G3
  SUCCESS: 523.25, // C5
  SUCCESS2: 659.25, // E5
  SUCCES3: 783.99, // G5
  SUCCESS4: 1046.50, // C6
} as const;

// ==================== AUDIO GAIN CONSTANTS ====================
const INITIAL_GAIN = 0.3; // 30% volume at start of playback
const END_GAIN = 0.01; // Nearly silent volume at end of fade-out

// For backwards compatibility, export as const object
export const frequencies = {
  yellow: FREQUENCIES.YELLOW,
  red: FREQUENCIES.RED,
  blue: FREQUENCIES.BLUE,
  green: FREQUENCIES.GREEN,
  gameOver: FREQUENCIES.GAME_OVER,
  success: FREQUENCIES.SUCCESS,
  success2: FREQUENCIES.SUCCESS2,
  success3: FREQUENCIES.SUCCES3,
  success4: FREQUENCIES.SUCCESS4,
} as const;

export type Frequence = keyof typeof frequencies;

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
  durationMs,
}: {
  frequence: Frequence;
  durationMs: number;
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
  gainNode.gain.setValueAtTime(INITIAL_GAIN, audioContext.currentTime);
  // Fade out the sound exponentially from 0.3 to 0.01 over the specified interval
  gainNode.gain.exponentialRampToValueAtTime(
    END_GAIN, // End volume (nearly silent)
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
