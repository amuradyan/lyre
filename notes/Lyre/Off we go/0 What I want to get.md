# What I want to get?
<!-- slide-id: f47ac10b-58cc-4372-a567-0e02b2c3d479 -->

Ideally, a path of how to implement a lisp-like language that makes music. I'd like to make it interactive, not boring, and coherent. Possible for anyone to follow the notes through and build the tool, small step at a time, understanding why each one is taken.

I have decided to call the language _Lyre_, since it __a)__ looks nice as a file extension, e.g. `mein-herz-brennt.lyre`, __b)__ is a musical instrument and __c)__ neatly packs a λ in the name.

I don't have a clear vision on what the language should do, but at least it should be able to __produce sequences and harmonies__ of notes and __loop__ them and such. It should __provide naming capabilities__, as in giving a name to a passage of music and then reusing it.

The language would look something like this:

```lisp
; A comment on the piece, its' name perhaps
(define
  the-passage
  (play-in-sequence
    (play-together a-pitch a-passage a-pitch ...)
    (play-together another-pitch another-passage ... )))

(repeat 3 the-passage)
```

It might do instrument sounds or allow writing filters, but we'll see when we get there. Either way, the notes should trace a walkable path to the latest state.

As its [predecessor](https://github.com/amuradyan/shvi), it will be written in JS, but with _streaming at its core_ this time, so it can _run in the browser_. While taking these notes, I'll do that from the standpoint of someone who knows nothing of the Javascript language and accompany the notes with exploratory JS exercises.

## Next

[Where do I start?](1%20Where%20do%20I%20start.md)
