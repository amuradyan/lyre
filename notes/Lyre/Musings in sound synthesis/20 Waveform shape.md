# Waveform shape
<!-- slide-id: fb141ed3-273a-4d84-84b8-ffc3db7efc28 -->
<!-- tags: waveforms, harmonics, timbre -->

We've given our sound the envelope of a plucked string, but it still doesn't sound like a lyre. The ADSR profile controls how the volume changes over time, but that's only half the story. The other half is the waveform itself - the actual shape of the vibration that produces the sound. Below are the _fundamental_ waveforms in synthesis:

* **Sine wave** - A pure tone with no harmonics. Sounds smooth and mellow, like a flute or tuning fork.
* **Square wave** - Contains only odd harmonics (1st, 3rd, 5th...). Sounds hollow and woody, like a clarinet.
* **Triangle wave** - Contains only odd harmonics but softer than square. Sounds like a mellow recorder or ocarina.
* **Sawtooth wave** - Contains all harmonics (1st, 2nd, 3rd, 4th...). Sounds bright and buzzy, like bowed strings (violin, cello) or plucked strings.

Together, the waveform and ADSR envelope shape an instrument's **timbre** - its characteristic sound quality that distinguishes it from other sources. Timbre is what allows us to tell apart a violin from a flute, or a human voice from a synthesizer. It also enables us to distinguish instruments within the same category, like an oboe from a clarinet (both woodwinds). The waveform determines what harmonics are present, while the ADSR determines how they evolve over time.

Real instruments produce complex, time-varying sounds, but each tends to be dominated by one of these basic shapes. A clarinet's tone is primarily square-like because its cylindrical bore emphasizes odd harmonics, whereas a flute approaches a sine wave because it produces few overtones. For plucked strings like the lyre, the dominant shape is the sawtooth waveform, which contains all harmonics with amplitudes following the pattern 1/n (half amplitude for the second harmonic, one-third for the third, and so on).

Let's see what DoReMi would sound like as a sawtooth wave.

##### Back: [ADSR](19%20ADSR.md)

##### Next: [Not yet a lyre](21%20Not%20yet%20a%20lyre.md)
