# Music notation
<!-- slide-id: 8c9e5b1c-7a3d-4f0b-9c8e-2a1e5b1c7a3d -->
<!-- tags: music, notation, tempo, rhythm -->

Let's look at the first line of the song:

```lyre
(sequence
  (envelope (tone 261.63) 0 0.5 0 0)
  (envelope (tone 261.63) 0 0.5 0 0)
  (envelope (tone 392.00) 0 0.5 0 0)
  (envelope (tone 392.00) 0 0.5 0 0)
  (envelope (tone 440.00) 0 0.5 0 0)
  (envelope (tone 440.00) 0 0.5 0 0)
  (envelope (tone 392.00) 0 1.0 0 0)
)
```

Notes of the melody seem to be important, so let us write them out first, using their names:

> C4 C4 G4 G4 A4 A4 G4 ???

And immediately a surprise: the last note of the first line is a single G4, just longer. In fact it is twice as long as any of the notes before it, if we look at the envelope sustains. How do we express that?

In traditional Western music, there isn't a single concept that does it, but there are _rhythm_ and _tempo_, that help us to figure out time durations. The former is the concept that captures the /relative/ length of notes. This is where we get our quarter notes, whole notes, sixteenths and such. In music scores they come with a distinctive notation. The latter deals in frequencies - namely defines how many beats per minute to play and is represented by a number.

The combination of the two above in a music sheet is called a _metronome mark_ and defines precisely how many times a specific rhythmic value plays in a minute. Here is a mark for 120 quarter notes per minute: `♩=120`

>+ In case the rhythmic value is missing, we might check another marking - the _time signature_. It captures the structure of the rhythm. It tells us how many beats are in a measure, and what rhythmic value constitutes one beat. For example, a 4/4 time signature means there are 4 beats in a measure /the top number/, and each beat plays a quarter note /the bottom number/. A 3/4 time signature means the quarter note appears thrice. When the rhythmic value is missing from the metronome mark, we can assume it is the same as the one in the time signature.

##### Back: [Twinkle, twinkle](60 Twinkle, twinkle.md)

##### Next: [Dots](62 Dots.md)
