export function* oscillator(frequency, sampleRate = 44100) {
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / sampleRate;

  while (true) {
    yield Math.sin(phase);
    phase = phase + phaseIncrement;
  }
}

export function computeAmplitude(n, totalSamples, adsr) {
  const [attackTime, decayTime, sustainLevel, releaseTime] = adsr;
  const sampleRate = 44100;
  const attackSamples = attackTime * sampleRate;
  const releaseSamples = releaseTime * sampleRate;
  const decaySamples = decayTime * sampleRate;

  if (n < attackSamples) {
    return (n + 1) / attackSamples;
  } else if (n < attackSamples + decaySamples) {
    const decayProgress = (n - attackSamples) / decaySamples;
    return 1 - (1 - sustainLevel) * decayProgress;
  } else if (n >= totalSamples - releaseSamples) {
    const releaseProgress = (totalSamples - n - 1) / releaseSamples;
    return sustainLevel * releaseProgress;
  } else {
    return sustainLevel;
  }
}

export function* tone(frequency, duration, sampleRate = 44100) {
  const totalSamples = Math.floor(sampleRate * (duration / 1000));
  const osc = oscillator(frequency, sampleRate);

  for (let n = 0; n < totalSamples; n++) {
    const sample = osc.next().value;
    yield [sample, n, totalSamples];
  }
}

export function* silence(duration, sampleRate = 44100) {
  const totalSamples = Math.floor(sampleRate * (duration / 1000));

  for (let n = 0; n < totalSamples; n++) {
    yield [0, n, totalSamples];
  }
}

export function* envelope(source, adsr = [0.01, 0.4, 0.8, 0.6]) {
  for (const [sample, n, totalSamples] of source) {
    const amplitude = computeAmplitude(n, totalSamples, adsr);
    yield [sample * amplitude, n, totalSamples];
  }
}

export function* extractSamples(source) {
  for (const [sample, n, totalSamples] of source) {
    yield sample;
  }
}
