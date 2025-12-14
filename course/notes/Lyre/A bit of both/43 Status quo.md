# Status quo
<!-- slide-id: 15c25b99-574a-4f65-84de-9fe95556f5df -->
<!-- tags: interpreter, limitations -->

Our interpreter works for `["tone", "261.63", "500"]`, but it's hardcoded for `tone` only:

```js
const interpret = function(expression) {
  const plucked = [0.01, 0.1, 0.7, 0.2];
  const [operator, ...operands] = expression;

  if (operator == "tone") {
    const frequency = parseFloat(operands[0]);
    const duration = parseInt(operands[1]) / 1000;
    return envelope(tone(frequency, duration), plucked);
  }
};
```

It checks if the operator is `"tone"`, converts the strings to numbers, and wraps the result in an envelope. That won't work for `["envelope", ["tone", "261.63", "500"], "0.01", "0.1", "0.7", "0.2"]` - we can't handle the nested list or the `"envelope"` operator.

##### Back: [Values](42%20Values.md)

##### Next: [Matryoshka](44%20Matryoshka.md)
