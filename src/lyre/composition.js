export function* sequence(...generators) {
  for (const gen of generators) {
    yield* gen;
  }
}

// Legacy array-based function for backward compatibility
export const sequenceArray = (...audioArrays) => {
  const combinedSamples = [];
  
  for (const audioArray of audioArrays) {
    for (const sample of audioArray) {
      combinedSamples.push(sample);
    }
  }
  
  return combinedSamples;
};

export function* parallel(...generators) {
  const activeGens = [...generators];
  let activeCount = activeGens.length;
  
  while (activeCount > 0) {
    let sum = 0;
    let validSamples = 0;
    
    for (let i = 0; i < activeGens.length; i++) {
      if (activeGens[i]) {
        const next = activeGens[i].next();
        if (next.done) {
          activeGens[i] = null;
          activeCount--;
        } else {
          sum += next.value;
          validSamples++;
        }
      }
    }
    
    if (validSamples > 0) {
      yield sum / validSamples;
    }
  }
}

// Legacy array-based function for backward compatibility
export const parallelArray = (...audioArrays) => {
  const maxLength = Math.max(...audioArrays.map((audio) => audio.length));
  const combinedSamples = [];
  const numArrays = audioArrays.length;

  for (let i = 0; i < maxLength; i++) {
    const samplesAtI = audioArrays.map((audio) => audio[i] || 0);
    const averageSample = samplesAtI.reduce((acc, sample) => acc + sample, 0) / numArrays;
    combinedSamples.push(averageSample);
  }
  
  return combinedSamples;
};

export function* repeat(times, generatorFunc) {
  for (let i = 0; i < times; i++) {
    yield* generatorFunc();
  }
}

// Legacy array-based function for backward compatibility
export const repeatArray = (times, audioArray) => {
  const samples = [];
  for (let i = 0; i < times; i++) {
    for (const sample of audioArray) {
      samples.push(sample);
    }
  }
  return samples;
};