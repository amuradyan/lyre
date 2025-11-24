# Plucking
<!-- slide-id: b0baaa33-4a2a-403a-affc-3b1141b979b9 -->

Now let's take care of the envelope. First, let's see how we would write that in Lyre. It's up to us as long as we keep the `(pull curtains down)` format. We can do what we do in JS by moving the parens around - `(envelope (tone 261.63 500) plucked)`. This immediately poses a problem - _the nested parens_, and here's where the `)` comes into play.

We will still create a new list each time we see a `(` and tokens will still go in that list. For `)` we'll do what we do now, plus we will append the list itself to it's parent - _closing_ the lists' scope in a way. To track the parent-childness of the expressions we will store them in a stack. To make a stack we will use... you guessed it - a list!

Let's do the manual run again, but this time with the `(envelope (tone ...`.

## Back

[Interpret](37%20Interpret.md)

## Next

[Stacking expressions](39%20Stacking%20expressions.md)
