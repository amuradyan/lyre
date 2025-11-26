# On to interpreting
<!-- slide-id: 80698164-4c62-437d-9a13-292db1661561 -->

Here's where we stand: we have a JS engine that can play sounds, and we have a tokenizer that can turn Lyre expressions into lists. What we don't have is the interpreter itself, so let's build one.

Our goal is to make `(tone 261.63 500)` produce actual sound. The tokenizer turns this string into a list `["tone", "261.63", "500"]`, then the interpreter evaluates that list into a sound.

Inspired by Lisps, our list evaluation will follow these rules:

    *Rule 1*: lists evaluate by applying the first element /operator/ to the rest of the elements as operands - `["tone", "261.63", "500"]` means "apply `tone` to to `261.63` frequency and  `500` duration"
    *Rule 2*: operators reference the synth functions
    *Rule 3*: operands evaluate to themselves - `"261.63"` and `"500"` are `261.63` and `500`

##### Back: [Tokenize](35%20Tokenize.md)

##### Next: [Interpret](37%20Interpret.md)
