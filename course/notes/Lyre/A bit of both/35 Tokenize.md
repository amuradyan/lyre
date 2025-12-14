# Tokenize
<!-- slide-id: 9770cb32-df68-46ae-900a-71d37652bb9a -->
<!-- tags: exercise, tokenization, switch -->

We need two accumulators: one for the current token being built, and one for the list of completed tokens. When we see a regular character, we append it to the token accumulator. When we see a space or a paren, we conclude the current token /if there is one/ and add it to the expression. The `process` function processes individual symbols using a switch statement, while `tokenize` loops through input and delegates to the handler.

```js:Tokenize
const {process} = SymbolProcessor;

function tokenize(input) {
  let token = "" // Current token being built
  let expression = [] // List of completed tokens

  for (const symbol of input) { // #! Go over all the symbols
    [token, expression] = process(???, ???, ???) // Update the token and expression
  }

  if (???) { // #! Don't forget the last token, if there is one
    expression.???(token)
  }

  return expression
}
```

```js:SymbolProcessor
function process(symbol, token, expression) {
  switch (???) { // #! Check the symbol
    case ???: // #! Opening paren 'creates' an empty expression
      return ["", []]
    case ???:
    case ")": // #! Closing paren and space both conclude tokens
      if (token != "") { // Only if we have a token to conclude
        return ["", [...expression, ???]]
      }
      return [token, expression]
    default: // Regular symbol otherwise - append to token
      return [token + ???, expression]
  }
}
```
<!-- {"function": "tokenize", "layout": "row", "tests": [
{"inputs": ["(move pawn e2e4)"], "expected": ["move", "pawn", "e2e4"]},
{"inputs": ["Bandwurmsatz"], "expected": ["Bandwurmsatz"]},
{"inputs": ["(hang coat rack)"], "expected": ["hang", "coat", "rack"]}]}
-->

The `tokenize` function iterates through each symbol and delegates handling to `process`. The handler returns an object with updated `token` and `expression` values. The `switch` checks each symbol against specific cases: `(` resets the expression, `)` or space conclude the current token, and everything else appends to the token accumulator. The final check ensures we don't lose a token that wasn't followed by a delimiter.

>+ Note that we could have grouped `(` with `)` and space since they all conclude tokens, making the code shorter. But keeping `(` separate makes the logic more explicit - we'll reorganize along the way.

##### Back: [By hand](34%20By%20hand.md)

##### Next: [On to interpreting](36%20On%20to%20interpreting.md)
