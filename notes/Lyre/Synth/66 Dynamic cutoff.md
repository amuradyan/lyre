# Dynamic cutoff
<!-- slide-id: dc182326-05a8-4894-a86d-8334ad1c8551 -->
<!-- tags: filters, envelopes, implementation -->

To vary the cutoff over time, we need to calculate a different cutoff value for each sample based on how much time has elapsed.

The approach: track the sample count, compute progress through the decay time, then interpolate between start and end cutoff values. For linear decay:

    `cutoff = startCutoff + (endCutoff - startCutoff) * progress`

Where `progress = min(1, sampleCount / decaySamples)` goes from 0 to 1 over the decay duration.

We can't create a new filter for each sample - that would reset the state variable `y` every time, breaking the filter. Instead, we update the alpha value dynamically within a single filter loop.

The `filterEnvelope` function is a generator that combines filter state with cutoff envelope logic. It takes a source, start cutoff, end cutoff, and decay time. For each sample from the source, it:

1. Calculates the current progress through the decay
2. Interpolates the cutoff from start to end based on progress
3. Computes alpha from the current cutoff
4. Applies the filter formula `y = y + alpha * (x - y)` with the updated alpha
5. Yields the filtered output

The filter state `y` persists across all samples, but alpha changes each sample to reflect the current cutoff frequency. This creates a smooth transition from bright to dull.

##### Back: [Filter envelopes](65%20Filter%20envelopes.md)

##### Next: [Building filter envelope](67%20Building%20filter%20envelope.md)
