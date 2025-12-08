# Pluck
<!-- slide-id: 418bf236-5aa4-43a2-beff-815996777f55 -->
<!-- tags: pluck, envelope -->

That Cmaj7 chord works, but it sounds nothing like a real lyre or harp. Real plucked strings ring and fade naturally over a second or two - you can't hold them longer by keeping your finger on the string. Our chord has a fixed 1-second duration with a sustain level, more like a synthesizer than a string instrument.

A plucked lyre string has a distinctive lifecycle: sharp attack, then it dies away naturally. The decay time is intrinsic to the string itself.

Let's try to simulate this with our current tools. We'll set sustain to 0 so the sound dies to silence, then use a long decay and release. The trick is to calculate tone duration from the ADSR times - attack + decay + release = 0.01 + 1.0 + 0.5 = 1.51 seconds. This way the sustain phase has no time to exist.

<!-- playable -->
```js:Pluck
const {tokenize} = Tokenizer;
const {interpret} = Interpreter;

const play = function(code) {
  const tokens = tokenize(code);
  const generator = interpret(tokens);
  return generator;
};

const pluck = `
  (envelope
    (tone 261.63 1510)
    0.01 1.0 0 0.5)`;

(function* () {
  yield* play(pluck);
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
        const [frequency, duration] = evaluated;
        return tone(frequency, duration / 1000);
      case "envelope":
        const [source, attackTime, decayTime, sustainLevel, releaseTime] = evaluated;
        return envelope(source, attackTime, decayTime, sustainLevel, releaseTime);
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

function* harmony(...generators) {
  let n = 0;
  let maxTotalSamples = 0;

  while (true) {
    let sum = 0;
    let allDone = true;

    for (const gen of generators) {
      const { value, done } = gen.next();
      if (!done) {
        const [sample, _, totalSamples] = value;
        sum = sum + sample;
        if (totalSamples > maxTotalSamples) {
          maxTotalSamples = totalSamples;
        }
        allDone = false;
      }
    }

    if (allDone) {
      return;
    }

    yield [sum, n, maxTotalSamples];
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

This is closer - the sound dies away naturally. But we're still manually calculating tone duration from ADSR times, which is error-prone. And it still doesn't quite sound like a real string - we're missing the brightness decay and harmonic richness of a plucked instrument.

Our architecture has a ceiling. To get there, we'll need to redesign.

##### Back: [Cmaj7](52%20Cmaj7.md)

##### Next: [Sustain and decay](54%20Sustain%20and%20decay.md)
