# Sustain and decay
<!-- slide-id: e1526ec7-9e90-42de-9332-e64f325361e7 -->
<!-- tags: architecture, envelope, design -->

Our current design works well for some instruments, but not others. Let's think about two categories:

**Sustained instruments** - organ, recorder, flute. Hold the key, sound continues at a steady level. Release the key, sound stops. Duration is controlled by the performer.

**Decaying instruments** - lyre, harp, piano. Pluck or strike, sound immediately starts dying. "Holding" doesn't extend it. Duration is intrinsic to the instrument.

Our current architecture favors sustained instruments:

```js
tone(frequency, duration)  // you specify how long it lasts
envelope(source, A, D, S, R)  // shapes within that duration
```

This creates a problem for decaying instruments. To make a pluck with sustain at 0%, we have to manually calculate: `duration = A + D + R`. If we change the ADSR, we must recalculate the tone duration. They're coupled.

```js
// Change decay from 1.0 to 1.5? Must update tone duration too
tone(261.63, 1510)  // was A+D+R = 0.01+1.0+0.5
envelope(source, 0.01, 1.5, 0, 0.5)  // now need 2010ms
```

## A better design

What if the oscillator just generates infinite samples, and the envelope decides when to stop?

```js
tone(frequency)  // infinite oscillator
envelope(source, A, D, S, R, gateTime)  // controls duration
```

Now `duration = A + D + gateTime + R`. For plucks, `gateTime = 0`. For sustained notes, `gateTime` is how long the key is held.

```js
// Pluck - no gate, dies naturally
envelope(tone(261.63), 0.01, 1.0, 0, 0.5, 0)  // duration = 1.51s

// Flute - gate held for 2 seconds
envelope(tone(440), 0.05, 0.05, 0.9, 0.1, 2.0)  // duration = 2.2s
```

This is how real synthesizers work. The envelope doesn't just shape amplitude - it controls the sound's lifetime. Change the ADSR, duration changes automatically. No manual calculation needed.

##### Back: [Pluck](53%20Pluck.md)

##### Next: [Making the change](55%20Making%20the%20change.md)
