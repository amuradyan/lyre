# Pluck and blow
<!-- slide-id: 92381db8-a956-42ae-92b1-0590272e30ed -->
<!-- tags: exercise, interpreter, integration -->

Update the interpreter to work with the new synth architecture. Remove duration from tone - it only needs frequency now. Add optional gateTime to envelope - it defaults to 0 for plucks, but sustained instruments specify it in milliseconds.

<!-- playable -->
```js:Instruments
const {tokenize} = Tokenizer;
const {interpret} = Interpreter;

const play = function(code) {
  const tokens = tokenize(code);
  const generator = interpret(tokens);
  return generator;
};

const pluck = `
  (envelope
    (tone 261.63)
    0.01 1.0 0 0.5)`;

const flute = `
  (envelope
    (tone 440)
    0.05 0.05 0.9 0.1 2000)`;

(function* () {
  yield* play(pluck);
  yield* play(flute);
})();
```

```js:Interpreter
const {tone, envelope, sequence, harmony} = Synth;

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
        const [???] = evaluated; // #! tone only needs frequency now
        return tone(???); // #! pass just frequency
      case "envelope":
        const [source, attackTime, decayTime, sustainLevel, releaseTime, ??? = ???] = evaluated; // #! extract gateTime, default to 0
        return envelope(source, attackTime, decayTime, sustainLevel, releaseTime, ??? / ???); // #! pass gateTime converted from ms to seconds
      case "sequence":
        return sequence(...evaluated);
      case "harmony":
        return harmony(...evaluated);
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
    return sustainLevel;
  }
}

function* tone(frequency) {
  const osc = oscillate(frequency);

  while (true) {
    const sample = osc.next().value;
    yield sample;
  }
}

function* envelope(source, attackTime, decayTime, sustainLevel, releaseTime, gateTime = 0) {
  const totalTime = attackTime + decayTime + gateTime + releaseTime;
  const totalSamples = totalTime * samplingRate;
  const adsr = [attackTime, decayTime, sustainLevel, releaseTime];

  let n = 0;
  for (const sample of source) {
    if (n >= totalSamples) {
      return;
    }
    const amplitude = adjustAmplitude(n, totalSamples, adsr);
    yield sample * amplitude;
    n = n + 1;
  }
}

function* sequence(...generators) {
  for (const generator of generators) {
    yield* generator;
  }
}

function* harmony(...generators) {
  let n = 0;
  let maxTotalSamples = 0;

  while (true) {
    let sum = 0;
    let allDone = true;

    for (const gen of generators) {
      const { value, done } = gen.next();
      if (!done) {
        sum = sum + value;
        allDone = false;
      }
    }

    if (allDone) {
      return;
    }

    yield sum;
    n = n + 1;
  }
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
    case "\n":
    case "\t":
    case "\r":
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

The key changes: tone no longer accepts duration, it just generates infinite samples. Envelope now has an optional sixth parameter for gateTime /in milliseconds/. If not provided, it defaults to 0 for plucks. If provided, the interpreter converts it from milliseconds to seconds before passing to envelope.

##### Back: [Updating the interpreter](57%20Updating%20the%20interpreter.md)

##### Next: [String harmonics](59%20String%20harmonics.md)
