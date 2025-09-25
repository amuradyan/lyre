export function* generateNote(frequency, duration, sampleRate = 44100) {
  const samplesPerNote = Math.floor(sampleRate * (duration / 1000));

  for (let i = 0; i < samplesPerNote; i++) {
    const t = i / sampleRate;
    yield Math.sin(2 * Math.PI * frequency * t);
  }
}

export function* generateSilence(duration, sampleRate = 44100) {
  const samplesPerSilence = Math.floor(sampleRate * (duration / 1000));

  for (let i = 0; i < samplesPerSilence; i++) {
    yield 0;
  }
}
