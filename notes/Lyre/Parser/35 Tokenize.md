# Tokenize
<!-- slide-id: 9770cb32-df68-46ae-900a-71d37652bb9a -->

We need two accumulators: one for the current token being built, and one for the list of completed tokens. We'll go through each character and handle three cases.

When we see a regular character, we append it to the token accumulator. When we see a space or a paren, we conclude the current token /if there is one/ and add it to the expression. That's it.

```js
function tokenize(input) {
  let token = "" // Current token being built
  let expression = [] // List of completed tokens

  for (const symbol of input) { // #! Go through each symbol
    switch (symbol) { // #! Check what the symbol is
      case ???: // #! Opening paren 'creates' an empty expression
        expression = []
        break
      case ")": // #! Closing paren and space both conclude tokens
      case ???:
        if (token != "") { // Only if we have a token to conclude
          expression.push(token)
          token = ??? // #! Don't forget to set it to ""
        }
        break
      default: // Regular symbol otherwise - append to token
        token = token + ???
    }
  }

  if (???) { // #! Don't forget the last token, if there is one
    expression.???(token)
  }

  return expression
}
```
<!-- {"layout": "row", "tests": [
{"inputs": ["(move pawn e2e4)"], "expected": ["move", "pawn", "e2e4"]},
{"inputs": ["(tone C4 500)"], "expected": ["tone", "C4", "500"]},
{"inputs": ["(hang coat rack)"], "expected": ["hang", "coat", "rack"]}]}
-->

The `switch` checks each symbol against specific cases. When we hit `(`, we reset the expression. When we hit `)` or space, we conclude the current token. Everything else gets appended to the token accumulator. The final check ensures we don't lose a token that wasn't followed by a delimiter.

>+ Note that we could have grouped `(` with `)` and space since they all conclude tokens, making the code shorter. But keeping `(` separate makes the logic more explicit - we'll reorganize along the way.

## Back

[By hand](34%20By%20hand.md)
