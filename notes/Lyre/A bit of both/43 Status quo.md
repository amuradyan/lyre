# Status quo
<!-- slide-id: 15c25b99-574a-4f65-84de-9fe95556f5df -->

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

We need to handle any operator, and when we see a list as an operand, evaluate it too. Our tokenizer produces string numbers like `"261.63"` and lists. We can check if something is a string with `typeof expression === 'string'`. Let's sketch what that looks like:

```js
const interpret = function(expression) {
  // Rule 3: check if expression is a string, i.e. a number
  if (typeof expression === 'string') {
    // it's a string number, convert and return
  } else { // it's a list, evaluate as expression
    // Rule 1: extract operator and operands
    const [operator, ...operands] = expression;

    // Rule 3: evaluate each operand
    for (const operand of operands) {
      if (typeof operand === 'string') {
        // convert the string number
      } else {
        // evaluate the list
      }
    }

    // Rule 2: operators reference synth functions
    switch (operator) {
      case "tone":
        // Rule 1: apply operator to evaluated operands
      case "envelope":
        // Rule 1: apply operator to evaluated operands
    }
  }
};
```

Now let's implement this.

##### Back: [Values](42%20Values.md)

##### Next: [Matryoshka](44%20Matryoshka.md)
