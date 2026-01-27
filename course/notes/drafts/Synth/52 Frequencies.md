# Frequencies
<!-- slide-id: 8f2df7f8-44de-4d0e-bac5-2fa159b10f4c -->
<!-- tags: synth, analysis, threshold -->

Let's say we want to take all the frequencies that are louder than -35dB. I think that is a loudness and richness enough to capture the essence of the sound while keeping it easy. The peaks of interest are tagged in the spectrum below:

![spectrum-analyzer](course/public/lyre-As3.wav|233,477,943,1864,4220,9650)

We can see that the second frequency peaks at a lower level than the first, the third and the fourth. This is typical for real instruments - higher harmonics tend to be quieter. We'll handle that later though. Let us just capture these frequencies as they are.

We can write a Lyre program that plays just these frequencies together.

##### Back: [Harmonics](51%20Harmonics.md)

##### Next: [Synthesis](53%20Synthesis.md)
