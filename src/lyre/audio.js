export function* generateNote(frequency, duration, sampleRate = 44100) {
  const samplesPerNote = Math.floor(sampleRate * (duration / 1000));
  const fadeSamples = Math.floor(sampleRate * 0.01);
  const sustainSamples = samplesPerNote - 2 * fadeSamples;

  for (let i = 0; i < samplesPerNote; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t);

    let envelope;
    if (i < fadeSamples) {
      envelope = i / fadeSamples;
    } else if (i < fadeSamples + sustainSamples) {
      envelope = 1;
    } else {
      const decayIndex = i - fadeSamples - sustainSamples;
      envelope = (fadeSamples - decayIndex) / fadeSamples;
    }

    yield sample * envelope;
  }
}

export function* generateSilence(duration, sampleRate = 44100) {
  const samplesPerSilence = Math.floor(sampleRate * (duration / 1000));

  for (let i = 0; i < samplesPerSilence; i++) {
    yield 0;
  }
}
