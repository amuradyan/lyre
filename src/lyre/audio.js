export function* generateNote(frequency, duration, sampleRate = 44100) {
  const samplesPerNote = Math.floor(sampleRate * (duration / 1000));

  for (let i = 0; i < samplesPerNote; i++) {
    const t = i / sampleRate;
    yield Math.sin(2 * Math.PI * frequency * t);
  }
}

// Legacy array-based function for backward compatibility
export const generateNoteArray = (frequency, duration, sampleRate = 44100) => {
  return [...generateNote(frequency, duration, sampleRate)];
};

export function* createNoteSequence(noteSequence, duration = 500) {
  const frequencies = {
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'F4': 349.23,
    'G4': 392.00,
    'A4': 440.00,
    'B4': 493.88
  };

  for (const note of noteSequence) {
    const frequency = frequencies[note] || 0;
    yield* generateNote(frequency, duration);
  }
}

// Silence generator
export function* generateSilence(duration, sampleRate = 44100) {
  const samplesPerSilence = Math.floor(sampleRate * (duration / 1000));
  
  for (let i = 0; i < samplesPerSilence; i++) {
    yield 0;
  }
}
