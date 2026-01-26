export const intervalMap = [1, 0.75, 0.5, 0.3]; // Speed up sound decay based on skill level

let currentOscillator = null as OscillatorNode | null;

// ==================== HELPER FUNCTIONS ====================
export const playSound = ({
  colorIndex,
  skillLevel = 1,
}: {
  colorIndex: number;
  skillLevel: number;
}) => {
  const frequencies = [329.63, 261.63, 220, 164.81]; // E4, C4, A3, E3

  if (currentOscillator) {
    currentOscillator.stop();
    currentOscillator.disconnect();
  }

  const interval = intervalMap[Math.max(skillLevel - 1, 0)];
  console.log(
    "Playing sound for color index:",
    colorIndex,
    "with interval:",
    interval,
    skillLevel,
  );
  // Create a new audio context to handle sound synthesis
  const audioContext = new window.AudioContext();

  // Create an oscillator to generate the sound wave
  const oscillator = audioContext.createOscillator();

  // Create a gain node to control volume/amplitude
  const gainNode = audioContext.createGain();

  // Connect oscillator to gain node, then gain node to speakers
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Set the frequency based on which color button was clicked
  oscillator.frequency.value = frequencies[colorIndex];

  // Use a sine wave for smooth, pure tone
  oscillator.type = "sine";

  // Set initial gain to 0.3 (30% volume) at the start of playback
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

  // Fade out the sound exponentially from 0.3 to 0.01 over 0.5 seconds
  // This creates a smooth decay effect instead of an abrupt stop
  gainNode.gain.exponentialRampToValueAtTime(
    0.01, // End volume (nearly silent)
    audioContext.currentTime + interval, // Duration in seconds
  );

  // Start playing the sound immediately
  oscillator.start(audioContext.currentTime);

  // Stop the sound after 0.5 seconds
  oscillator.stop(audioContext.currentTime + interval);

  currentOscillator = oscillator;
};
