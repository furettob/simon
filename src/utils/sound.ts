// ==================== HELPER FUNCTIONS ====================
export const playSound = (colorIndex: number) => {
  const frequencies = [329.63, 261.63, 220, 164.81]; // E4, C4, A3, E3
  const audioContext = new (window.AudioContext || window.AudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequencies[colorIndex];
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.5,
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};