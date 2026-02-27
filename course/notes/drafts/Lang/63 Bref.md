# Bref
<!-- slide-id: 1b8f4e09-91c9-4142-bf46-8629d7a3c886 -->
<!-- tags: gate time, envelope, variadic -->

Looking at it again, we see that every note in our melody needs the same envelope. Can we apply it once to a group of tones instead of wrapping each note individually?

```lyre@4.7.0
(sequence
  (envelope (tone 261.63) 0 0.5 0 0)
  (envelope (tone 261.63) 0 0.5 0 0)
  (envelope (tone 392.00) 0 0.5 0 0)
  (envelope (tone 392.00) 0 0.5 0 0)
  (envelope (tone 440.00) 0 0.5 0 0)
  (envelope (tone 440.00) 0 0.5 0 0)
  (envelope (tone 392.00) 0 1.0 0 0))
```

To do this we have to expect the tones either at the front or the back of the arguments. To me the tail end reads better, so let's move it there.

Another thing we have to deal with is right now we provide 4 ADSR arguments and the gate time defaults to `0`. When we allow multiple tones with different durations, we can't skip parameters anymore. We'll make all 5 explicit - ADSR and gate time. We can also replace the tones in frequency with their names.

```lisp
(sequence
  (envelope 0 0.5 0 0 0
    C4 C4 G4 G4 A4 A4)
  (envelope 0 1.0 0 0 0
    G4))
```

Not bad. Can we do better?

##### Back: [Dots](62%20Dots.md)

##### Next: [What if...](64%20What%20if....md)
