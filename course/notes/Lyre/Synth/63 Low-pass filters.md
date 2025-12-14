# Low-pass filters
<!-- slide-id: 6f763c9d-a5bc-4eb7-9568-77b67c768297 -->
<!-- tags: filters, low-pass, theory -->

A low-pass filter does exactly what its name suggests - it lets low frequencies pass through while attenuating /reducing/ high frequencies. The boundary is the cutoff frequency.

The simplest digital low-pass filter is a first-order recursive filter. It uses one state variable and one formula:

    `y = y + alpha * (x - y)`

Where:
- `x` is the input sample
- `y` is the output sample /and the filter's state/
- `alpha = cutoff / samplingRate` controls the filter strength

How does this work? The output `y` gradually tracks the input `x` at a rate determined by `alpha`. When `alpha` is close to 1 /high cutoff/, the output follows the input quickly - most frequencies pass through. When `alpha` is small /low cutoff/, the output changes slowly - the filter smooths out rapid changes, removing high frequencies.

The filter is a generator function that wraps a source. It maintains the state variable `y`, reads samples from the source, applies the formula, and yields the filtered result.

Think of it like this: the filter has memory /the `y` variable/. Each new sample pushes the output a fraction of the way toward the input. High-frequency oscillations in the input can't push the output fast enough to follow them, so they get smoothed out.

##### Back: [Evolving timbre](62%20Evolving%20timbre.md)

##### Next: [Building a filter](64%20Building%20a%20filter.md)
