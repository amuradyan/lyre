import { runStreaming } from '/lyre/evaluator.js';
import { extractSamples, envelope } from '/lyre/audio.js';

class LyreStreamingProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.isPlaying = false;
    this.currentGenerator = null;
    this.ended = false;

    this.port.onmessage = (event) => {
      const { type, code } = event.data;

      if (type === 'code') {
        try {
          const result = runStreaming(code);
          const withEnvelope = envelope(result);
          this.currentGenerator = extractSamples(withEnvelope);
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
          outputChannel[i] = next.value || 0;
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

registerProcessor('lyre-processor', LyreStreamingProcessor);
