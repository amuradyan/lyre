# Cmaj7
<!-- slide-id: aa83b7cc-de65-4417-b00f-f4ac9fb804b0 -->

Let's implement `parallel`. We'll test it with a Cmaj7 chord - C, E, G, and B played together, a jazz staple.

The idea is simple: pull a sample from each generator, add them up, yield the sum. Repeat until all generators are exhausted.

When one tone ends before others, we keep going - the finished generator contributes nothing, the rest continue. This pads with silence naturally.

The loop keeps asking "are we done yet?" by checking each generator. If any are still running, the answer is "not yet!" When all are done, we stop.

<!-- playable -->
```js:Cmaj7
const {tokenize} = Tokenizer;
const {interpret} = Interpreter;

const play = function(code) {
  const tokens = tokenize(code);
  const generator = interpret(tokens);
  return generator;
};

const Cmaj7 = `
  (envelope
    (parallel
      (tone 261.63 1000)
      (tone 329.63 1000)
      (tone 392.00 1000)
      (tone 493.88 1000))
    0.01 0.1 0.7 0.2)`;

(function* () {
  yield* play(Cmaj7);
})();
```

```js:Interpreter
const {tone, envelope, sequence, parallel} = Synth;

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
      case "sequence":
        return sequence(...evaluated);
      case "parallel":  // #! add the "parallel" case
        return parallel(...evaluated);  // #! call parallel with all _evaluated_ operands
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

function* parallel(...generators) {
  let n = 0;  // track our current sample index
  let maxTotalSamples = 0;  // track the longest duration

  while (???) {  // #! loop forever, asking "are we done?"
    let sum = ???; // #! initially it's 0
    let allDone = true;  // assume all generators are done

    for (const gen of ???) {  // #! check each generator
      const { value, done } = gen.next();  // pull the next sample and status
      if (???) {  // #! if this generator is still running
        const [sample, _, totalSamples] = value; // remember the sample structure?
        sum = ??? + ???;  // #! add the sample value to the sum
        if (totalSamples > maxTotalSamples) {  // find the longest generator
          maxTotalSamples = ???;  // #! update the max if needed for proper enveloping
        }
        allDone = ???;  // #! we're not done yet!
      }
    }

    if (???) {  // #! if all generators finished
      return;  // stop the generator
    }

    yield [sum, n, maxTotalSamples];  // yield tuple for envelope
    n = ???;  // #! increment sample counter
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

##### Back: [The plan](51%20The%20plan.md)
