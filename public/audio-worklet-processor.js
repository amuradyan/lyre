class StreamingAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isPlaying = false;
    this.sampleBuffer = [];
    this.bufferIndex = 0;
    
    this.port.onmessage = (event) => {
      const { type, samples } = event.data;
      
      if (type === 'samples') {
        // Add new samples to buffer
        this.sampleBuffer.push(...samples);
        this.isPlaying = true;
      } else if (type === 'stop') {
        this.isPlaying = false;
        this.sampleBuffer = [];
        this.bufferIndex = 0;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannel = output[0];

    if (!this.isPlaying || this.sampleBuffer.length === 0) {
      // Fill with silence when no samples available
      outputChannel.fill(0);
      return true;
    }

    for (let i = 0; i < outputChannel.length; i++) {
      if (this.bufferIndex >= this.sampleBuffer.length) {
        // No more samples, fill rest with silence
        outputChannel.fill(0, i);
        this.isPlaying = false;
        this.port.postMessage({ type: 'ended' });
        break;
      } else {
        outputChannel[i] = this.sampleBuffer[this.bufferIndex];
        this.bufferIndex++;
      }
    }

    return true;
  }
}

registerProcessor('lyre-processor', StreamingAudioProcessor);