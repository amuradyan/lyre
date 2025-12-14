export const samplingRate = 44100;

export function* oscillate(frequency) {
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / samplingRate;

  while (true) {
    yield Math.sin(phase);
    phase = phase + phaseIncrement;
  }
}

export function* tone(frequency) {
  const osc = oscillate(frequency);

  while (true) {
    const sample = osc.next().value;
    yield sample;
  }
}

export function* sawtooth(frequency) {
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / samplingRate;

  while (true) {
    const value = -1 + 2 * (phase / (2 * Math.PI));

    yield value;
    phase = phase + phaseIncrement;

    if (phase >= 2 * Math.PI) {
      phase = phase - 2 * Math.PI;
    }
  }
}
