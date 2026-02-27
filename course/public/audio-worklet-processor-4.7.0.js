import { tokenize, interpret } from '/lyre-4.7.0.bundle.js';

class LyreStreamingProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    globalThis.SAMPLE_RATE = sampleRate;

    this.isPlaying = false;
    this.currentGenerator = null;
    this.ended = false;

    this.port.onmessage = (event) => {
      const { type, code } = event.data;

      if (type === 'code') {
        try {
          const tokens = tokenize(code);
          const generator = interpret(tokens);
          this.currentGenerator = generator;
          this.isPlaying = true;
          this.ended = false;
        } catch (error) {
          this.port.postMessage({ type: 'error', error: error.message });
        }
      } else if (type === 'stop') {
        this.isPlaying = false;
        this.currentGenerator = null;
        this.ended = false;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannel = output[0];

    if (!this.isPlaying || !this.currentGenerator || this.ended) {
      outputChannel.fill(0);
      return true;
    }

    try {
      for (let i = 0; i < outputChannel.length; i++) {
        const next = this.currentGenerator.next();

        if (next.done) {
          outputChannel.fill(0, i);
          this.isPlaying = false;
          this.ended = true;
          this.port.postMessage({ type: 'ended' });
          break;
        } else {
          const [sample] = next.value;
          outputChannel[i] = sample || 0;
        }
      }
    } catch (error) {
      this.port.postMessage({ type: 'error', error: error.message });
      outputChannel.fill(0);
      this.isPlaying = false;
    }

    return true;
  }
}

registerProcessor('lyre-processor-4-7-0', LyreStreamingProcessor);
