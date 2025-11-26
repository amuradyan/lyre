# Stacking expressions
<!-- slide-id: fe9ebaa7-f7ac-4e3e-950a-5a5a72b0c5ee -->

Let's tokenize `(envelope (tone 261.63 500) plucked)`, by hand once more, and see what happens with nested parens. This time we'll track a _stack_ of expressions - a list of lists where the last one is the current expression we're building.

```text
  symbol  |  token  | expression stack
 at  hand |   acc.  |
-----------------------------------------------------
( ....... | ""      | [[]]  // push new list onto stack
e ....... | "e"     | [[]]  // append letter to token
n ....... | "en"    | [[]]  // ...
...       | ...     | ...
_ ....... | ""      | [["envelope"]] // conclude token, add to current list
( ....... | ""      | [["envelope"], []]  // push new nested list
t ....... | "t"     | [["envelope"], []]  // ...
o ....... | "to"    | [["envelope"], []]  // ...
...       | ...     | ...
0 ....... | "500"   | [["envelope"], ["tone", "261.63"]] // ...
) ....... | ""      | [["envelope", ["tone", "261.63", "500"]]] // pop and append to parent
_ ....... | ""      | [["envelope", ["tone", "261.63", "500"]]] // space
p ....... | "p"     | [["envelope", ["tone", "261.63", "500"]]] // ...
l ....... | "pl"    | [["envelope", ["tone", "261.63", "500"]]] // ...
...       | ...     | ...
) ....... | ""      | ["envelope", ["tone", "261.63", "500"], "plucked"] // pop final
```

The key insight: `)` concludes the token _and_ pops the current list off the stack, appending it to its parent. On to the implementation.

##### Back: [Plucking](38%20Plucking.md)

##### Next: [Tokenize again](40%20Tokenize%20again.md)
