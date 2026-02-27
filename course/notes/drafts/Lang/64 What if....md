# What if
<!-- slide-id: fb319c6e-0dc5-4ac3-a8ab-d0c7ea544613 -->
<!-- tags: Lyre, syntax, draft -->

```lisp
(sequence
  (envelope 0 0.5 0 0 0
    C4 C4 G4 G4 A4 A4)
  (envelope 0 1.0 0 0 0
    G4))
```

This applies the envelope to multiple notes in fewer words, but it's still more machinery than music. What if we could write something like this instead?

```lisp
(set! . 0.5) ; set the tempo

; `piano` applies the envelope to each tone.
; The gate time is computed from the dot notation.
(define piano (adsr 0.01 0.1 0.3 0.2))

(piano C4 C4 G4 G4 A4 A4 :G4) ; stream the notes
```

Now this reads like music. We define an instrument with `piano`, set the tempo with `.`, and play the notes. The `:` prefix extends the last note's duration, just like we explored earlier.

We'll discuss `define` in detail later, they're friends with `set!`. For now, let's figure out how to get here. We'll start with the easiest piece - comments.

##### Back: [Bref](63%20Bref.md)

##### Next: [Drafts](../drafts.md)
