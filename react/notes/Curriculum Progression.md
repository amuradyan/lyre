# Shvi Curriculum Progression: Feature-to-JavaScript Construct Mapping

This document lists (step by step) which JavaScript constructs are required as the learner progresses through the Shvi language implementation. Every construct shown is tied to an actual occurrence in `sintez.js` (with file:line references). If a concept is mentioned but not yet required at that step, it is deferred to a later step.

Source file: `sintez.js`

| Step | Walkthrough | New Shvi Feature | Newly Needed JS Concepts (only those first required here) |
|------|-------------|------------------|-----------------------------------------------------------|
| 01 | 01-making-a-sound | Raw tone generation | Numbers, const/let, function declaration, classic for, arithmetic, Math API, array push, return |
| 02 | 02-a-better-language-for-instructions | Flat tokenization | String trimming, Array.from, Number.parseFloat, Number.isNaN, Symbols, ternary, small arrow fn |
| 03 | 03-following-commands | Nested tokenization + evaluator recursion | Recursion, destructuring `[head,...tail]`, rest params, switch, typeof, Array.isArray, spread, higher-order `map`, logical &&, base-case returns |
| 04 | 04-do-re-mi | Sequencing + fades | Helper inner functions (closures), default param, typed arrays (Int16Array), spread concatenation |
| 05 | 05-chords | Parallel playback | Math.max + spread, `map`, `reduce`, fallback `||`, average computation |
| 06 | 06-again-and-again | Repetition | Nested loops (`for` inside `for...of`), function reuse, accumulation pattern reuse |
| 07 | 07-look-it-up | Environment lookup (notes & silence) | Array `find`, error reporting (console.error), symbol table pattern |
| 08 | 08-naming-things | Definitions (`define`) | Special-form detection, environment mutation via `unshift`, recursive evaluation of remaining program |
| (Later) | (not in numbered steps) | Saving WAV / presets | async/await, ArrayBuffer, DataView, object literals for presets |

---
## Step 01 – Making a Sound (Tone Generation)
New concepts introduced here.

```javascript
// sintez.js:14-24
function generatePCM(frequency, duration, offset = 0) {
  const totalSamples = Math.floor(SAMPLE_RATE * (duration / 1000));
  // ...existing code...
  const generateAttack = (frequency, fadeSamples, offset) => {
    const samples = [];
    for (let i = 0; i < fadeSamples; i++) {
      const t = (offset + i) / SAMPLE_RATE;
      const sample = AMPLITUDE * Math.sin(2 * Math.PI * frequency * t) *
        (i / fadeSamples);
      samples.push(sample);
    }
    return samples;
  };
  // ...existing code...
}
```

Highlights:
- Number literals (lines 3, 4, 15) - `const AMPLITUDE = 32767;`, `const SAMPLE_RATE = 44100;`
- `const` vs `let` (lines 15, 20) - immutable vs mutable variables
- Function declaration (line 14) - `function generatePCM(...) {}`
- Classic `for` loop (line 20) - `for (let i = 0; i < fadeSamples; i++)`
- Arithmetic & Math API (`Math.sin`, `Math.PI`, `Math.floor` lines 15, 22)
- Array creation & `push` (lines 18–24) - building sample arrays incrementally

## Step 02 – Flat Tokenization
Introduce interpreting strings into tokens.

```javascript
// sintez.js:158-159
const tokenize = (input) => {
  const graphemes = Array.from(input.trim());
  // ...existing code...
};

// sintez.js:141-143
const typeify = (token) => {
  const parsedNumber = Number.parseFloat(token, 10);
  return Number.isNaN(parsedNumber) ? Symbol.for(token) : parsedNumber;
};
```

Highlights:
- `Array.from` (line 159) - convert string to character array
- `trim()` (line 159) - remove leading/trailing whitespace
- `Number.parseFloat` & `Number.isNaN` (line 142–143) - string to number conversion
- `Symbol.for` (line 143) - create unique symbol atoms
- Ternary operator (line 143) - concise conditional expression

## Step 03 – Nested Tokenization & Evaluator Skeleton
Adds recursion, list structure, switch.

```javascript
// sintez.js:163-207
const loop = (
  progressiveScope,
  [graphemeAtHand, ...restOfGraphemes], // destructuring with rest
  tokenSoFar = "", // default parameter
) => {
  const [currentScope, parentScope, ...outerScopes] = progressiveScope;

  if (!graphemeAtHand) { // base case
    return tokenSoFar.length > 0
      ? [...currentScope, typeify(tokenSoFar)] // spread in array literal
      : currentScope;
  }

  switch (graphemeAtHand) {
    case "(": {
      // ...existing code...
      return loop( // recursive call
        newProgressiveScope,
        restOfGraphemes,
      );
    }
    // ...existing cases...
    default:
      return loop(
        progressiveScope,
        restOfGraphemes,
        tokenSoFar + graphemeAtHand, // string concatenation
      );
  }
};
```

Evaluator skeletal recursion:
```javascript
// sintez.js:247-276
const evaluate = (expression) => {
  if (typeof expression === "number") { // type checking
    return expression;
  }

  if (typeof expression === "symbol") {
    return lookupInEnvironment(expression);
  }

  if (Array.isArray(expression)) { // array type check
    const [first, ...rest] = expression; // destructuring

    if (Array.isArray(first) && first[0] === atom("define")) { // logical &&
      // ...existing code...
    } else {
      const [operator, ...operands] = expression;
      const evaluatedOperator = evaluate(operator); // recursion
      const evaluatedOperands = operands.map(evaluate); // higher-order map
      return evaluatedOperator(...evaluatedOperands); // spread in call
    }
  }
};
```

Highlights:
- Recursion (`loop` calling itself, `evaluate` calling itself)
- Destructuring `[graphemeAtHand, ...restOfGraphemes]` - extract head and tail
- Default parameter `tokenSoFar = ""` - fallback value
- `switch` statement - multi-branch conditional
- `typeof` comparisons - runtime type checking
- `Array.isArray` - specific array type detection
- Higher-order `map` - function as data transformation
- Spread in function calls - unpack arguments

## Step 04 – Sequencing & Fades
Adds helper closures, typed arrays, default params already seen.

```javascript
// sintez.js:70-84
function sequence(...PCMs) { // rest parameter
  let totalSamples = 0;
  for (const pcm of PCMs) { // for...of loop
    totalSamples += pcm.length; // accumulation pattern
  }

  const combinedSamples = [];
  for (const pcm of PCMs) {
    for (const sample of pcm) { // nested for...of
      combinedSamples.push(sample);
    }
  }
  return combinedSamples;
}

// sintez.js:47 (from generatePCM)
const samples = new Int16Array([...attack, ...sustain, ...decay]); // typed array with spread
```

Highlights:
- Rest parameter (line 70) - collect variable arguments
- Nested `for...of` (lines 72, 76–77) - iterate over collections
- Accumulation pattern (lines 71–73) - building up totals
- Typed array instantiation (line 47) - `Int16Array` for audio samples
- Spread concatenation - merge arrays efficiently

## Step 05 – Parallel (Chords)
Parallel computation & higher-order functions.

```javascript
// sintez.js:87-100
function parallel(...PCMs) {
  const maxLength = Math.max(...PCMs.map((pcm) => pcm.length)); // Math.max with spread
  const combinedSamples = [];
  const numPCMs = PCMs.length;

  for (let i = 0; i < maxLength; i++) {
    const samplesAtI = PCMs.map((pcm) => pcm[i] || 0); // fallback with ||
    const averageSample = samplesAtI.reduce((acc, sample) => acc + sample, 0) / // reduce with accumulator
      numPCMs;
    combinedSamples.push(averageSample);
  }
  return combinedSamples;
}
```

Highlights:
- `Math.max` with spread (line 88) - find maximum from array
- Arrow callback in `map` (lines 88, 92) - inline function expressions
- Fallback `|| 0` (line 92) - handle undefined values
- `reduce` with accumulator (line 93) - fold operation for summation
- Division for averaging (lines 93–94) - mathematical computation

## Step 06 – Repetition
Repeat function.

```javascript
// sintez.js:101-109
function repeat(times, PCM) {
  const samples = [];
  for (let i = 0; i < times; i++) { // classic for loop
    for (const point of PCM) { // for...of loop
      samples.push(point);
    }
  }
  return samples;
}
```

Highlights:
- Outer classic `for` loop (line 103) - count-based iteration
- Inner `for...of` (line 104) - value-based iteration
- Reusing accumulation idiom - consistent pattern application

## Step 07 – Environment Lookup (Notes & Silence)
Lookup and error handling.

```javascript
// sintez.js:293-301
const environment = [
  // Core functions
  [atom("silence"), (duration) => generatePCM(0, duration)], // arrow function closure
  [atom("tone"), generatePCM],
  [atom("repeat"), repeat],
  [atom("sequence"), sequence],
  [atom("parallel"), parallel],
  // ...existing code...
};

// sintez.js:228-238
const lookupInEnvironment = (name) => {
  const matchingDefinition = environment.find(([key]) => key === name); // find with destructuring
  if (matchingDefinition) {
    return matchingDefinition[1];
  } else {
    const errorMessage = `🪈 Error: Unknown name ... ${atom(name)}`;
    console.error(errorMessage); // error reporting
    return errorMessage;
  }
};
```

Highlights:
- `find` with destructuring (line 229) - search with pattern matching
- Arrow function predicate (line 229) - inline comparison function
- `console.error` (line 233) - diagnostic output
- Template literal for error messages - string interpolation
- Silence implementation: arrow producing PCM with frequency 0 (line 295)

## Step 08 – Definitions (`define` Special Form)
Environment mutation & control flow in evaluator.

```javascript
// sintez.js:260-268
if (Array.isArray(first) && first[0] === atom("define")) { // special form detection
  const [_, name, value] = first; // throwaway binding with _
  const evaluatedValue = evaluate(value);
  environment.unshift([name, evaluatedValue]); // environment mutation

  if (rest.length === 1) { // conditional program continuation
    return evaluate(rest[0]);
  } else {
    return evaluate(rest);
  }
}
```

Highlights:
- Pattern match for special form (line 260) - recognize define syntax
- Throwaway binding `_` in destructuring (line 261) - ignore unused values
- Environment mutation via `unshift` (line 263) - add new bindings at front
- Conditional branch on remaining program (lines 265–268) - handle program flow

## Later (Not in Core Step Sequence)
WAV encoding & presets (advanced I/O & data layout).

```javascript
// sintez.js:110-137
async function encodeWAV( // async function
  samples,
  output = "output.wav", // default parameter
  sampleRate = 44100,
) {
  const headerSize = 44;
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(headerSize + dataSize); // binary buffer
  const view = new DataView(buffer); // binary view

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i)); // binary writes
    }
  };

  // ...existing WAV header setup...

  await Deno.writeFile( // await async operation
    output,
    new Uint8Array(buffer), // typed array wrapper
  );
}

// sintez.js:356-374 (instrument presets)
[atom("piano"), { // object literal configuration
  waveform: "triangle",
  attackTime: 0.005,
  decayTime: 0.1,
  sustainLevel: 0.7,
  releaseTime: 0.3,
}],
```

Highlights:
- `async` / `await` (lines 110, 134) - asynchronous programming
- `ArrayBuffer`, `DataView` (lines 117–118) - binary data manipulation
- Binary writes (`setUint8`, `setUint16`, `setUint32`, `setInt16`) - low-level data encoding
- Typed array wrapper `Uint8Array` (line 136) - byte array representation
- Object literal configuration values - structured data

---
## Deferred / Not Used in Current Implementation
The following JavaScript features are intentionally NOT introduced (avoid premature teaching):
- `for...in`, `while`, `do...while`
- `try/catch/finally`
- `class` syntax
- Optional chaining, nullish coalescing
- Manual `new Promise` usage
- Module `import` statements (only `export { ... }` appears at line 0)

---
## Suggested Lesson Gating
- Only introduce each construct the step *before* or *at* first required use.
- Provide micro-exercises: e.g. Step 05: rewrite `parallel` using manual summation before `reduce` is shown.
- Delay async/binary internals to an "Exporting Audio" bonus chapter.

---
## Quick Index (Concept → First Line Reference)
- Function declaration: 14
- Arrow function (helper): 18, 141
- Recursion: 163–207 (loop), 247–276 (evaluate)
- Destructuring: 165, 168, 257, 269
- Rest parameter: 70, 87
- Spread (array literal): 47, 171–172
- Spread (function call): 275
- map: 88, 92, 273
- reduce: 93
- find: 229
- unshift: 263
- Int16Array: 47
- ArrayBuffer/DataView: 117–118
- async/await: 110, 134
- Symbols: 143, 295+ (environment keys)

---
This file is auto-derived from the current `sintez.js`; if the implementation evolves, regenerate to keep line references accurate.
