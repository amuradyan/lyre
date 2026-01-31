export const createAudioContext = () => {
  return new (window.AudioContext || window.webkitAudioContext)();
};

export const loadAndConvertSamples = async (audioContext) => {
  const response = await fetch('/samples.json');
  const samples = await response.json();

  const sampleRate = audioContext.sampleRate;
  const audioBuffer = audioContext.createBuffer(1, samples.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < samples.length; i++) {
    channelData[i] = samples[i] / 32768.0;
  }

  return audioBuffer;
};

export const playAudioBuffer = async (audioContext, audioBuffer, onEnded) => {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  
  source.onended = onEnded;
  source.start();
  
  return source;
};

export const stopAudioSource = (source) => {
  if (source) {
    source.stop();
  }
};