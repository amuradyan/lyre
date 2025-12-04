# Sequence
<!-- slide-id: 1039f9e5-95a8-448d-84b8-452fcdfba4f1 -->

We can play single tones with envelopes. Now let's play multiple notes one after another - a sequence.

The `sequence` function in the synth takes multiple sound generators and yields from each in turn using `yield*`. Your job is to add the "sequence" case to the interpreter.

<!-- playable -->
```js:App
const {tokenize} = Tokenizer;
const {interpret} = Interpreter;

const play = function(code) {
  const tokens = tokenize(code);
  const generator = interpret(tokens);
  return generator;
};

const DoReMi = `
  (envelope
    (???
      (tone 261.63 500) (tone 293.66 500) (tone 329.63 500))
    0.01 0.1 0.7 0.2)`;

(function* () {
  yield* play(DoReMi);
})();
```

```js:Tokenizer
const {process} = SymbolProcessor;

function tokenize(input) {
  let token = "";
  let expressions = [[]];

  for (const symbol of input) {
    [token, expressions] = process(symbol, token, expressions);
  }

  if (token != "") {
    const current = expressions[expressions.length - 1];
    current.push(token);
  }

  const result = expressions.pop();
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
    case ???:  // #! the new line is "/n"
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
const {tone, envelope, sequence} = Synth;

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
      case "sequence":  // #! add the "sequence" case
        return sequence(...evaluated);  // #! call sequence with all evaluated operands
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

function* sequence(...generators) {
  for (const generator of generators) {
    yield* generator;
  }
}
```

##### Back: [Playing Lyre](46%20Playing%20Lyre.md)
