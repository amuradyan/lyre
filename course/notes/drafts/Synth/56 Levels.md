# Levels
<!-- slide-id: c77cb93c-a81a-42d5-93ca-7e1351ff7448 -->
<!-- tags: synth, gain, spectrum, clipping -->

The pluck was closer to the real thing, but there's still that harsh hiss at the start. This is because each tone plays at *full volume*, and `harmony` adds them all together. Six tones at full amplitude sum to a signal way louder than what speakers can reproduce, so it *clips* /distorts/ at the edges.

So we need to adjust the volume - but to what values? Let's look back at the spectrum and read the levels off directly:

![spectrum-analyzer](course/public/lyre-As3.wav|237,473,926,1873,4220,9646)

Each peak has a dB level. We can convert that to a linear amplitude with `10^(dB/20)`. The fundamental at -23dB becomes the loudest, while 473Hz at -33dB is barely there.

> For 237Hz at -23.33dB: `10^(-23.33/20)` = 0.068. All six tones sum to 0.264. So the gain is `0.068 / 0.264` = 0.26.

We *normalize* - divide each value by the total so the sum equals 1.0. That's the key constraint: `harmony` adds all tones together, and anything above 1.0 clips.

>+ Maybe that is something our `harmony` primitive could do automatically? We'll get to this primitive operation later and see if we need to update it.

##### Back: [A♯3](55%20A♯3.md)

##### Next: [... no gain](57%20...%20no%20gain.md)
