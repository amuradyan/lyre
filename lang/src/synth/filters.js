import { samplingRate } from './oscillators.js';

export function* filter(source, cutoff) {
  const alpha = cutoff / samplingRate;
  let y = 0;

  for (const x of source) {
    y = y + alpha * (x - y);
    yield y;
  }
}

export function* filterEnvelope(source, startCutoff, endCutoff, decayTime) {
  const decaySamples = decayTime * samplingRate;
  let y = 0;
  let n = 0;

  for (const x of source) {
    const progress = Math.min(1, n / decaySamples);
    const cutoff = startCutoff + (endCutoff - startCutoff) * progress;
    const alpha = cutoff / samplingRate;

    y = y + alpha * (x - y);
    yield y;

    n = n + 1;
  }
}
