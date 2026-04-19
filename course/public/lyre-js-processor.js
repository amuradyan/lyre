import { raw, wrap, modulate } from '/lang/synth/oscillators.js';
import { envelope, gain, gate } from '/lang/synth/envelopes.js';
import { lowpass, highpass } from '/lang/synth/filters.js';
import { sequence, harmony, mix } from '/lang/synth/composition.js';
import { arithmetic } from '/lang/synth/math.js';

globalThis.raw = raw;
globalThis.wrap = wrap;
globalThis.modulate = modulate;
globalThis.envelope = envelope;
globalThis.gain = gain;
globalThis.gate = gate;
globalThis.lowpass = lowpass;
globalThis.highpass = highpass;
globalThis.sequence = sequence;
globalThis.harmony = harmony;
globalThis.mix = mix;
globalThis.arithmetic = arithmetic;

class LyreJsProcessor extends AudioWorkletProcessor {
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
          this.currentGenerator = (0, eval)(code);
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

  process(inputs, outputs) {
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
          const sample = Array.isArray(next.value) ? next.value[0] : next.value;
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

registerProcessor('lyre-js-processor', LyreJsProcessor);
