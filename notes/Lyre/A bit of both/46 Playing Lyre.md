# Playing Lyre
<!-- slide-id: a0f4e70c-09a7-42a4-b324-da45cbf49f4c -->

We have tokenizer, interpreter, synth - all the pieces ready. Let's connect them.

We need a `play` function that takes Lyre code as a string and turns it into a sound generator. The flow is simple: tokenize the code into a list, then interpret that list into a generator.

<!-- playable -->
```js:C4
const {tokenize} = Tokenizer;
const {interpret} = Interpreter;

const play = function(code) {
  const tokens = ???(code);  // #! tokenize the code into a list
  const generator = ???(tokens);  // #! interpret the list into a sound generator
  return generator;
};

(function* () {
  yield* play("(envelope (tone 261.63 500) 0.01 0.1 0.7 0.2)");
})();
```

```js:Tokenizer
const {process} = SymbolProcessor;

function tokenize(input) {
  let token = "";
  let expressions = [[]];

  for (const symbol of input) {
    // #! process the symbol
    [token, expressions] = ???(symbol, token, expressions);
  }

  if (token != "") {
    const current = expressions[expressions.length - 1];
    current.push(token);
  }

  const result = expressions.pop();
  // ! Tokenize returns a list containing the expression, extract it with [0]
  return result[0];
}
```

```js:SymbolProcessor
function process(symbol, token, expressions) {
  const current = expressions[expressions.length - 1];

  switch (symbol) {
    case "(":
      expressions.push([]);
      return ["", expressions];
    case " ":
      if (token != "") {
        current.push(token);
      }
      return ["", expressions];
    case ")":
      if (token != "") {
        current.push(token);
      }
      const completed = expressions.pop();
      const parent = expressions[expressions.length - 1];
      parent.push(completed);
      return ["", expressions];
    default:
      return [token + symbol, expressions];
  }
}
```

```js:Interpreter
const {tone, envelope} = Synth;

function interpret(expression) {
  if (typeof expression === 'string') {
    return parseFloat(expression);
  } else {
    const [operator, ...operands] = expression;

    const evaluated = [];
    for (const operand of operands) {
      if (typeof operand === 'string') {
        evaluated.push(parseFloat(operand));
      } else {
        evaluated.push(interpret(operand));
      }
    }

    switch (operator) {
      case "tone":
        const [frequency, duration] = evaluated;
        return tone(frequency, duration / 1000);
      case "envelope":
        const [source, attackTime, decayTime, sustainLevel, releaseTime] = evaluated;
        return envelope(source, attackTime, decayTime, sustainLevel, releaseTime);
    }
  }
}
```

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

function* envelope(source, attackTime, decayTime, sustainLevel, releaseTime) {
  const adsr = [attackTime, decayTime, sustainLevel, releaseTime];
  for (const [sample, n, totalSamples] of source) {
    const amplitude = adjustAmplitude(n, totalSamples, adsr);
    yield sample * amplitude;
  }
}
```

>+ The action is in `Tokenizer` - we extract the first element from the list that `expressions.pop()` returns. If tokenization is correct, there's exactly one expression. If there's more than one, something went wrong - but we're assuming correct input for now and will handle error cases later.

##### Back: [What next?](45%20What%20next.md)

##### Next: [Sequence](47%20Sequence.md)
