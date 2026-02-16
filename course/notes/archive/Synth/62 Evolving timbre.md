# Evolving timbre
<!-- slide-id: 6d99a8f6-816b-497e-99f6-18cf99fdcba0 -->
<!-- tags: filters, timbre, motivation -->

Our sawtooth sounds more  artificial. It has the right pitch and duration, but it sounds static and mechanical - like a buzzer, not a musical instrument.

Listen to a real plucked string on a lyre. When you first pluck it, the sound is bright - rich with high harmonics. As the string vibrates, the sound becomes duller. The high frequencies decay faster than the low frequencies. This happens because high-frequency vibrations lose energy more quickly through air resistance and internal damping in the string.

![spectrum-analyzer]()

![synthesis-diagram]()

Our current sawtooth maintains all its harmonics at constant ratios throughout the sound. The amplitude envelope controls how loud it is, but not how bright it is. The timbre stays frozen.

We need a way to remove high frequencies and control that removal over time. This is what filters do. A low-pass filter lets low frequencies pass through while blocking high frequencies. By controlling the filter's cutoff frequency over time with a filter envelope, we can make our synthetic string start bright and become dull - just like a real one.

##### Back: [Direct waveforms](61%20Direct%20waveforms.md)

##### Next: [Low-pass filters](63%20Low-pass%20filters.md)
