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

```js:Synth
const samplingRate = 44100;

function* oscillate(frequency) {
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / samplingRate;

  while (true) {
    yield Math.sin(phase);
    phase = phase + phaseIncrement;
  }
}

function adjustAmplitude(n, totalSamples, adsr) {
  const [attackTime, decayTime, sustainLevel, releaseTime] = adsr;
  const attackSamples = attackTime * samplingRate;
  const releaseSamples = releaseTime * samplingRate;
  const decaySamples = decayTime * samplingRate;

  if (n < attackSamples) {
    return (n + 1) / attackSamples;
  } else if (n < attackSamples + decaySamples) {
    const decayProgress = (n - attackSamples) / decaySamples;
    return 1 - (1 - sustainLevel) * decayProgress;
  } else if (n >= totalSamples - releaseSamples) {
    const releaseProgress = (totalSamples - n - 1) / releaseSamples;
    return sustainLevel * releaseProgress;
  } else {
    return sustainLevel
  }
}

function* tone(frequency, duration) {
  const totalSamples = duration * samplingRate;
  const osc = oscillate(frequency);

  for (let n = 0; n < totalSamples; n = n + 1) {
    const sample = osc.next().value;
    yield [sample, n, totalSamples];
  }
}

function* envelope(source, adsr) {
  for (const [sample, n, totalSamples] of source) {
    const amplitude = adjustAmplitude(n, totalSamples, adsr);
    yield sample * amplitude;
  }
}
```

Awesome! How do we evaluate this now?

## Back

[Stacking expressions](39%20Stacking%20expressions.md)

## Next
