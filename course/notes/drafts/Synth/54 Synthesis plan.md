# Synthesis plan
<!-- slide-id: e9d0a3ce-4dcd-4bb9-8f25-8f9245226f4d -->
<!-- tags: architecture, harmony, interpreter -->

We know we need to add samples together. Looking at our current architecture, we have two places to work at.

**In the Synth** - we need to add a `harmony` function alongside its brethren.

```js
function* oscillate(frequency) {...}
function* tone(frequency, duration) { ... }
function* sequence(...generators) { ... }
...
// add the `harmony` generator
```

It takes multiple generators and yields from all of them simultaneously, adding their values together at each sample point.

**In the Interpreter** - we need to add a case for "harmony" that calls the synth's `harmony` function.

```js
switch (operator) {
  case "tone": ...
  case "envelope": ...
  // match the "harmony" case
}
```

So the pattern is the same as when we added `sequence`:

- Write the synth function `harmony` that combines generators by adding samples
- Add the interpreter case `"harmony"` that calls it
- Test it with Lyre code like `(harmony (tone 261.63) (tone 329.63))`

##### Back: [Wave fundamentals](53%20Wave%20fundamentals.md)

##### Next: [A♯3](55%20A♯3.md)
