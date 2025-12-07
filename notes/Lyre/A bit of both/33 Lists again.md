# Lists again
<!-- slide-id: 437fbe48-4b0b-41f8-8e48-594e6709653f -->
<!-- tags: lisp, expressions, lists -->

We know how to turn a `sentence like this` into a JS list of words, but Lyre, being a Lisp-like language, operates on expressions wrapped in parens like `(move pawn e2e4)`. If we split the expression with spaces, we get words like `"(move"` and `"e2e4)"`. What do we do with the parens? What's the deal with them anyway? Let's talk some Lisp.

A language's _look_ is heavily influenced by its grammar. JS looks like `for (const . in ...)` and `mix(jin, jermuk)` because it deals with statements structured according to a specific grammar its engine can read and interpret. It knows what to expect after a `for` or a `mix`, and to the left and right of the `=` when it sees one.

Lisps, on the other hand, deal with expressions that are basically lists - hence the name "lisp interpreter." The equivalent of `mix(jin, jermuk)` in Lisp would be a list of words like `(mix jin jermuk)`. The interpreter knows it will interpret a list of words, specifically, the first one as the operator and the rest as operands.

>+ We can also have an 'expression' that has no parens - a single symbols and Lisps should evaluate that properly, but we don't consider that here since it's not relevant yet

Back to our problem: the correct interpretation of `"(move pawn e2e4)"` would be `["move", "pawn", "e2e4"]` - parens being the list with tokens in it.

Now we just need to figure out how to do that.

##### Back: [Exercises on strings](32%20Exercises%20on%20strings.md)

##### Next: [By hand](34%20By%20hand.md)
