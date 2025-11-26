# Nested expressions
<!-- slide-id: 7a58d536-159d-499f-80cc-c9b6cd0cc364 -->

Looking at `(envelope (tone 261.63 500) plucked)`, I have two questions:

    - What do we do with the `(tone ...)` nested inside `envelope`, and
    - What about `plucked`?

Our [evaluation rule 3](#on-to-interpreting) states that _operands evaluate to themselves_. If that's true, then the `(tone ...)` will evaluate to the list itself, whereas we would like it to be a sound generator that will go in `envelope` to be `plucked`. This breaks because expressions can be nested and lists can be arguments. Good thing we know how to evaluate lists - we just need to rephrase our third rule.

    *Rule 3*: operands evaluate to themselves if they are numbers, otherwise they evaluate as lists

And then there is `plucked`. It is not a list, it's not a number and it's misplaced for an operator. However, just like `envelope` and `tone`, it is a name that refers to a value - to `[0.01, 0.1, 0.7, 0.2]` in our case. This idea of names is an important thing of its own and we'll get into that later. Right now Lyre can live without having the equivalent of `const plucked = [0.01, 0.1, 0.7, 0.2];`. Instead, we'll expand the `plucked` to four numbers here and we already know how to handle those.

This is what we'll be evaluating: `(envelope (tone 261.63 500) 0.01 0.1 0.7 0.2)`

>+ We can fix this by extending the third rule to also handle the case when it's not a list, not /yet/ a number, and look it up in the Synth, but that would force us into a messy partial implementation of something we'll do properly along the way.

##### Back: [Tokenize again](40%20Tokenize%20again.md)

## Next
