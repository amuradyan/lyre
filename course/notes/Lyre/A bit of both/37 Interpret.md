# Interpret
<!-- slide-id: 398db218-ab17-49fd-9966-c0cd5952886f -->
<!-- tags: exercise, interpreter, evaluation -->

Our first version of interpreter is rather simple: check if the operator is `"tone"`, extract the operands, convert them from strings to numbers, and call the synth `tone`.

For now, we'll hardcode the envelope and ADSR values and the envelope directly in the interpreter, but we'll work it in neatly pretty soon. We'll make something simple but working first.

<!-- playable -->
```js:Interpreter
const {tone, envelope} = Synth;

const interpret = function(expression) {
  const plucked = [0.01, 0.1, 0.7, 0.2];
  // The line below deconstructs the expression into its head as ???
  // and tails as `operands`. `...` prefix means it is a list
  const [???, ...operands] = ???;  // #! Deconstruct the expression

  if (operator == ???) { // #! Check, it the operator is "tone"
    const frequency = parseFloat(operands[0]);  // Frequency in decimals
    const duration = parseInt(operands[???]) / ???; // #! Durations is in milliseconds

    // Envelope it manually for now
    return envelope(tone(???, ???), ???); // #! Frequency, durations and plucked, right?
  }
};

(function* () { // Streaming the sound
  ??? interpret(["tone", "261.63", "500"]);  // #! To stream the sound we `yield*`, remember?
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

function* envelope(source, adsr) {
  for (const [sample, n, totalSamples] of source) {
    const amplitude = adjustAmplitude(n, totalSamples, adsr);
    yield sample * amplitude;
  }
}
```

>+ We pick the [0.01, 0.1, 0.7, 0.2] values for the plucked envelope because they look reasonable for a pluck. When you play it however, you will hear that it's quite far from a real plucked string. We'll improve it later, when we analyze as sample of an A#3 plucked on a lyre. You'll be surprised to see how complex and surprising the whole sound is!

##### Back: [On to interpreting](36%20On%20to%20interpreting.md)

##### Next: [Plucking](38%20Plucking.md)
