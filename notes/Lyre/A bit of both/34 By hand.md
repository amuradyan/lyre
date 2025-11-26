# By hand
<!-- slide-id: 3ca5af90-369b-43fc-8e91-f0c8acab3566 -->

So, we need to turn a string into a list of strings. Obviously, if the string is empty, the list is empty - this one is easy. What do we do if it's not? We know that string split leaves us with the `(` and the word pinned together, but the `(` has a special meaning and has to be treated accordingly. We can run around after the split and handle the parens, but there's a more elegant way.

If we treat the string as a list of characters, we can go over each one and treat them case by case. Let's run the algo manually on `(move pawn e2e4)` and see what cases come up.

```text
  symbol  |  token  | expression
 at  hand |   acc.  |    acc.
-----------------------------------------------------
( ....... | ""      | []  // create a list
m ....... | "m"     | []  // append the letter to token accumulator
o ....... | "mo"    | []  // append the lett...
v ....... | "mov"   | []  // ...
e ....... | "move"  | []  // ...
_ ....... | ""      | ["move"] // conclude a token and append it to the expression
p ....... | "p"     | ["move"] // append the lett...
a ....... | "pa"    | ["move"] // ...
...       | ...     | ...
e ....... | "e2e"   | ["move", "pawn"] // ...
4 ....... | "e2e4"  | ["move", "pawn"] // ...
) ....... | ""      | ["move", "pawn", "e2e4"] // this also concludes and appends the token.
```

Here's what we have:

- regular characters get appended to the token accumulator
- spaces conclude the current token and add it to the expression
- `(` creates the empty expression, a list to be filled, and
- `)` does the same as spaces. Note that `)` doesn't _close a list_ /whatever that would mean/. It will do something important rather soon though.

Let's implement `tokenize`.

##### Back: [Lists again](33%20Lists%20again.md)

##### Next: [Tokenize](35%20Tokenize.md)
