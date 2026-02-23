# Dots
<!-- slide-id: 9b1c7a3d-4f0b-9c8e-8f8f-2a1e5b1c7a3d -->
<!-- tags: dot notation -->

This is all good but does not help us. We deal in times per tone, so maybe what we can do is define a smallest duration and then express the rest of the durations as multiples of it? Music has a notation for prolonging a note - the `.`. It adds half of the note's value to itself, so a dotted quarter note is 1.5 times as long as a regular quarter note. We can draw inspiration from that and rewrite the first line of the song as follows:

```lisp
(set! . 0.5) ; define the smallest duration as a half second

(.C4 .C4 .G4 .G4 .A4 .A4 :G4)
```

This reads well enough, eh? Note the `.` before the note names - it indicates that the note should be played for the smallest duration. The last note is preceded by a `:`, which indicates that it should be played for twice the smallest duration. Following the same logic, `.:G4` would indicate a note that should be played thrice as long and `::G4` would indicate a note that should be played four times as long.

We can get rid of the `.` before the note names, assuming that the smallest duration is the default, and rewrite the code as follows:

```lisp
(set! . 0.5) ; define the smallest duration as a half second

(C4 C4 G4 G4 A4 A4 :G4)
```

Let's park it here for now. We have a nice way to express the melody and the rhythm, but we still have to solve the `envelope`.

##### Back: [Music notation](61%20Music%20notation.md)

##### Next: [Drafts](../drafts.md)
