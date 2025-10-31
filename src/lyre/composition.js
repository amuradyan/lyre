export function* sequence(...generators) {
  for (const gen of generators) {
    yield* gen;
  }
}


export function* harmony(...generators) {
  const activeGens = [...generators];
  let activeCount = activeGens.length;

  while (activeCount > 0) {
    let sum = 0;
    let validSamples = 0;
    let maxN = 0;
    let maxTotal = 0;

    for (let i = 0; i < activeGens.length; i++) {
      if (activeGens[i]) {
        const next = activeGens[i].next();
        if (next.done) {
          activeGens[i] = null;
          activeCount--;
        } else {
          const value = next.value;
          if (Array.isArray(value)) {
            const [sample, n, totalSamples] = value;
            sum += sample;
            maxN = Math.max(maxN, n);
            maxTotal = Math.max(maxTotal, totalSamples);
          } else {
            sum += value;
          }
          validSamples++;
        }
      }
    }

    if (validSamples > 0) {
      const mixedSample = sum / validSamples;
      if (maxTotal > 0) {
        yield [mixedSample, maxN, maxTotal];
      } else {
        yield mixedSample;
      }
    }
  }
}


export function* repeat(times, generatorFunc) {
  for (let i = 0; i < times; i++) {
    yield* generatorFunc();
  }
}
