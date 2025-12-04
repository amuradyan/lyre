# Tokenize again
<!-- slide-id: 2bc141b2-c470-4598-b8b3-6a14f3ea84cc -->

Now let's implement the nested tokenizer. We'll use a list of lists for expressions to track the current expression and its parents - rightmost being the newest child. When we see `(`, we push a new list onto expressions. When we see `)`, we pop the current list and append it to its parent.

```js:Tokenize
const {process} = SymbolProcessor;

function tokenize(input) {
  let token = "";
  let expressions = ???; // #! Start the stack with one empty expression to build into

  for (const symbol of input) {
    [token, expressions] = process(???, token, ???); // #! Pass all three to the handler
  }

  if (token != "") {
    const current = expressions[???]; // #! Get the last expression - the rightmost child
    current.push(token);
  }

  // `.pop()` removes and returns the last element from a list
  return expressions.pop(); // #! Return the final expression
}
```

```js:SymbolProcessor
function process(symbol, token, expressions) {
  const current = expressions[???]; // #! The rightmost child is the current expression

  switch (symbol) {
    case "(":
      expressions.push([]); // Push new empty expression onto the list
      return [???, expressions]; // #! Reset token, keep expressions
    case " ":
      if (???) { // #! Only push if we have a token to push
        current.push(token);
      }
      return ["", expressions];
    case ")":
      if (token != "") {
        current.push(token);
      }
      const completed = ???; // #! Remove the current expression from the list
      const parent = ???; // #! Now the rightmost is the parent
      parent.push(???); // #! Append the completed expression to its parent
      return [???, expressions]; // #! What should the token be now?
    default:
      return [token + symbol, ???]; // #! Keep building the token and expressions
  }
}
```
<!-- {"function": "tokenize", "layout": "row", "tests": [
{"inputs": ["tone"], "expected": ["tone"]},
{"inputs": ["(tone 261.63 500)"], "expected": [["tone", "261.63", "500"]]},
{"inputs": ["(envelope (tone 261.63 500) plucked)"], "expected": [["envelope", ["tone", "261.63", "500"], "plucked"]]}]}
-->

Awesome! How do we evaluate this now?

##### Back: [Stacking expressions](39%20Stacking%20expressions.md)

##### Next: [Nested expressions](41%20Nested%20expressions.md)
