# Frequencies
<!-- slide-id: 8f2df7f8-44de-4d0e-bac5-2fa159b10f4c -->
<!-- tags: synth, analysis, threshold -->

Let's say we want to take all the frequencies that are louder than -35dB. I think that is loud and rich enough to capture the essence of the sound while keeping it easy. The peaks of interest are tagged in the spectrum below:

![spectrum-analyzer](course/public/lyre-As3.wav|237,473,926,1873,4220,9646)

Notice that for `A#3` being the fundamental it's not a clean slope. 473Hz is quieter than 9646Hz, and 1873Hz is louder than 926Hz. Real instruments are messy like that. The fundamental is loudest, but the harmonics don't just fade uniformly upward. We'll handle that later though. Let us just capture these frequencies as they are.

We can write a Lyre program that plays just these frequencies together.

##### Back: [Harmonics](51%20Harmonics.md)

##### Next: [Waves](53%20Waves.md)
