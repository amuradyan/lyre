# Matryoshka 🪆
<!-- slide-id: d203236e-b81b-4526-90d0-9154e7c666e6 -->

We have `["envelope", ["tone", 261.63, 500], 0.01, 0.1, 0.7, 0.2]` with a `tone` nested inside. When we evaluate the operands, we check each one: if it's a number, convert it; if it's a list, evaluate it as an expression. Let's implement this.

<!-- playable -->
```js:Interpreter
const {tone, envelope} = Synth;

const interpret = function(expression) {
  // Rule 3: check if expression is a string number
  if (typeof expression === 'string') {
    return parseFloat(expression);
  } else {
    // it's a list, evaluate as expression

    // Rule 1: extract operator and operands
    const [operator, ...operands] = expression;

    // Rule 3: evaluate each operand
    const evaluated = [];
    for (const operand of operands) {
      if (typeof operand === 'string') {
        evaluated.push(parseFloat(operand));
      } else {
        evaluated.push(interpret(operand));
      }
    }

    // Rule 2: operators reference synth functions
    switch (operator) {
      case "tone":
        return tone(evaluated[0], evaluated[1]);
      case "envelope":
        return envelope(evaluated[0], evaluated[1], evaluated[2], evaluated[3], evaluated[4]);
    }
  }
};

(function* () {
  yield* interpret(["envelope", ["tone", "261.63", "500"], "0.01", "0.1", "0.7", "0.2"]);
})();
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

##### Back: [Status quo](43%20Status%20quo.md)
