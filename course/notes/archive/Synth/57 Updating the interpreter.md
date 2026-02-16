# Updating the interpreter
<!-- slide-id: 72148a77-07f8-4517-a16c-e460b1d2d651 -->
<!-- tags: interpreter, integration, refactor -->

We've redesigned the synth, but our Lyre interpreter still expects the old signatures. The interpreter's tone case extracts duration and passes it to a function that no longer accepts it. The envelope case doesn't know about gateTime.

Here's the current interpreter logic:

```js
...
case "tone":
  const [frequency, duration] = evaluated;
  return tone(frequency, duration / 1000);
case "envelope":
  const [source, attackTime, decayTime, sustainLevel, releaseTime] = evaluated;
  return envelope(source, attackTime, decayTime, sustainLevel, releaseTime);
...
```

With our new synth, tone doesn't take duration anymore - it generates infinite samples. And envelope needs a sixth parameter, gateTime, to control how long the sustain phase lasts. For plucks, gateTime defaults to 0. For sustained instruments, it's specified in milliseconds.

New Lyre syntax:

```lisp
(envelope (tone 261.63) 0.01 1.0 0 0.5)         ; pluck - no gate time
(envelope (tone 440) 0.05 0.05 0.9 0.1 2000)   ; flute - 2000ms gate
```

We need to update the interpreter: remove duration from tone, add optional gateTime to envelope.

##### Back: [Instruments](56%20Instruments.md)

##### Next: [Pluck and blow](58%20Pluck%20and%20blow.md)
