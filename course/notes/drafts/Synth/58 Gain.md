# Gain
<!-- slide-id: 1f814aa5-56e4-4605-98d9-a95d405bf4c3 -->
<!-- tags: exercise, synth, gain -->

Time to wire it up. `gain` is the simplest primitive we've built - it just scales each sample by a level. Add it to the Synth and hook it into the Interpreter.

<!-- playable -->
```js:A#3
const {tokenize} = Tokenizer;
const {interpret} = Interpreter;

const play = function(code) {
  const tokens = tokenize(code);
  const generator = interpret(tokens);
  return generator;
};

const A_sharp_3 = `
  (envelope
    (harmony
      (gain (tone 237) 0.26)
      (gain (tone 473) 0.08)
      (gain (tone 926) 0.17)
      (gain (tone 1873) 0.20)
      (gain (tone 4220) 0.14)
      (gain (tone 9646) 0.15))
    0.01 0 1 1 0)`;

(function* () {
  yield* play(A_sharp_3);
})();
```

```js:Interpreter
const {tone, envelope, sequence, harmony, gain} = Synth;

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
        const [frequency] = evaluated;
        return tone(frequency);
      case "envelope":
        const [source, attackTime, decayTime, sustainLevel, releaseTime, gateTime = 0] = evaluated;
        return envelope(source, attackTime, decayTime, sustainLevel, releaseTime, gateTime);
      case "sequence":
        return sequence(...evaluated);
      case "harmony":
        return harmony(...evaluated);
      case ???:  // #! add the "gain" case
        const [signal, ???] = evaluated; // #! destructure signal and level
        return ???(???, ???);  // #! call gain with signal and level
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
  }
}

function* gain(source, level) {
  for (const sample of ???) {  // #! iterate over the source
    yield ??? * ???;  // #! scale the sample by the level
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

##### Back: [... no gain](57%20...%20no%20gain.md)

##### Next: [Drafts](../drafts.md)
