# Waves
<!-- slide-id: 0752f3c3-1166-4c12-abde-fbb9a78dc72b -->

How do we combine two sounds? What happens when a C note and an E note play at the same time?

Physically, when two sound waves meet in air, their amplitudes add at each point in time. That's it. If wave A has amplitude 0.5 at some moment and wave B has amplitude 0.3 at that same moment, the combined wave has amplitude 0.8.

This is called _superposition_ - waves pass through each other, and at every instant, the total displacement is just the sum of individual displacements.

![Two sine waves and their sum](https://www.acs.psu.edu/drussell/demos/superposition/beats.gif)

Let's look at concrete numbers. Say we have two sine waves sampled at 4 Hz, both 1 second long. When one is silence, the result is just the other wave - silence contributes nothing. When both waves are identical, they add up to double the amplitude, making the sound louder:

```plain
      Wave 1 /1 Hz/      |      Wave 2 /2 Hz/      |        Combined
-----------------------------------------------------------------------------
 `[0.0, 1.0, 0.0, -1.0]` | `[0.0, 0.0, 0.0, 0.0]`  | `[0.0, 1.0, 0.0, -1.0]`
 `[0.0, 1.0, 0.0, -1.0]` | `[0.0, 1.0, 0.0, -1.0]` | `[0.0, 2.0, 0.0, -2.0]`
```

This is how chords and overtones should work. A C major chord is C + E + G - three sine waves at 261.63 Hz, 329.63 Hz, and 392.00 Hz, added together sample by sample. A plucked string produces its fundamental frequency plus harmonics at 2x, 3x, 4x that frequency. What we hear is the sum of all these components.

So combining sounds comes down to addition at each sample point - this we can do.

##### Back: [What we have](49%20What%20we%20have.md)

##### Next: [The plan](51%20The%20plan.md)
