export const sequence = (...audioArrays) => {
  const combinedSamples = [];
  
  for (const audioArray of audioArrays) {
    for (const sample of audioArray) {
      combinedSamples.push(sample);
    }
  }
  
  return combinedSamples;
};

export const parallel = (...audioArrays) => {
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

export const repeat = (times, audioArray) => {
  const samples = [];
  for (let i = 0; i < times; i++) {
    for (const sample of audioArray) {
      samples.push(sample);
    }
  }
  return samples;
};