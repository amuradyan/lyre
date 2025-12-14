# Matryoshka 🪆
<!-- slide-id: d203236e-b81b-4526-90d0-9154e7c666e6 -->
<!-- tags: exercise, interpreter, recursion -->

We need to handle any operator, and when we see a list as an operand, evaluate it too. Our tokenizer produces string numbers like `"261.63"` and lists. To check if something is a string, we use `typeof expression === 'string'`. Let's implement this.

<!-- playable -->
```js:Interpreter
const {tone, envelope} = Synth;

const interpret = function(expression) {
  // Rule 3: check if expression is a string number
  if (typeof expression === 'string') { // `typeof` checks the type
    return ???(expression); // #! turn it into a decimal with `parseFloat`
  } else { // it's a list, evaluate as expression
    // Rule 1: extract operator and operands
    const [operator, ...???] = expression;

    // Rule 3: evaluate each operand
    const evaluated = [];
    for (const operand of operands) {
      if (???) {  // #! Check if operand is a string
        evaluated.push(???(operand));
      } else {
        evaluated.push(???(???));  // #! We shall `interpret` it then
      }
    }

    // Rule 2: operators reference synth functions
    ??? (operator) {  // #! `switch` over the known words
      case "tone":
        const [frequency, duration] = evaluated;  // #! Extract frequency and duration
        return ???; // #! tone duration is in milliseconds, right?
      case "envelope":
        const ??? = evaluated;  // #! Extract source and ADSR values
        return envelope(???, ???, ???, ???, ???);
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

>+ Switch cases use strict equality by default - `case "tone"` checks if operator is exactly the string `"tone"`. In JS, we have two equality operators: `==` /loose/ and `===` /strict/. The strict version `===` checks both value and type, while `==` converts types before comparing. We'll use `===` from now on.

##### Back: [Status quo](43%20Status%20quo.md)

##### Next: [What next?](45%20What%20next.md)
