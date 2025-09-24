export const generateNoteSamples = (frequency, duration, sampleRate = 44100) => {
  const samplesPerNote = Math.floor(sampleRate * (duration / 1000));
  const samples = [];

  for (let i = 0; i < samplesPerNote; i++) {
    const t = i / sampleRate;
    samples.push(Math.sin(2 * Math.PI * frequency * t));
  }

  return samples;
};

export function* createNoteSequence(noteSequence, duration = 500) {
  const frequencies = {
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'F4': 349.23,
    'G4': 392.00,
    'A4': 440.00,
    'B4': 493.88,
    'PAUSE': 0.0
  };

  for (const note of noteSequence) {
    const frequency = frequencies[note] || 440;
    yield generateNoteSamples(frequency, duration);
  }
}
