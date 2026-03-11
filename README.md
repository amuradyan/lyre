# Lyre 🪉

[![Tests](https://github.com/amuradyan/lyre/actions/workflows/test.yml/badge.svg)](https://github.com/amuradyan/lyre/actions/workflows/test.yml)

Lyre is a musical Lisp interpreter backed by a JavaScript synthesis engine. Write music as code using s-expressions, play it from the command line, or use it as a library to build audio applications.

```lisp
-(
  (envelope 0.01 0.1 0.7 0.2 0.35 (tone 261.63))
  (envelope 0.01 0.1 0.7 0.2 0.35 (tone 261.63))
  (envelope 0.01 0.1 0.7 0.2 0.35 (tone 392.00))
  (envelope 0.01 0.1 0.7 0.2 0.35 (tone 392.00))
  (envelope 0.01 0.1 0.7 0.2 0.35 (tone 440.00))
  (envelope 0.01 0.1 0.7 0.2 0.35 (tone 440.00))
  (envelope 0.01 0.1 0.7 0.2 0.85 (tone 392.00)))
```

The `-()` is syntactic sugar for `sequence`. You can also use `=()` for `harmony` to play notes simultaneously.

Save this as `twinkle.lyre` and play it:

```bash
cd lang
bin/lyre samples/twinkle.lyre --play
```

## Project Structure

This is a monorepo containing:

- **`lang/`** - The `@lyre/core` library (language + synth engine) - standalone, usable independently
- **`course/`** - An interactive educational platform exploring language implementation

The `lang/` package can be used on its own without the course.

## Quick Start

**Play a Lyre file:**
```bash
cd lang
bin/lyre samples/twinkle.lyre --play
```

**Use as a library:**
```bash
npm install @lyre/core
```

```js
import { tone, envelope, sequence } from '@lyre/core/synth';

const melody = sequence(
  envelope(tone(261.63), 0.01, 0.1, 0.7, 0.2, 0.5),
  envelope(tone(293.66), 0.01, 0.1, 0.7, 0.2, 0.5)
);

for (const sample of melody) {
  // process audio sample
}
```

See [lang/README.md](lang/README.md) for full API documentation.

## Getting Started

```bash
# Clone and install dependencies
git clone https://github.com/amuradyan/lyre.git
cd lyre
npm install

# Set up git hooks
git config core.hooksPath .githooks

# Try the language
cd lang
bin/lyre samples/twinkle.lyre --play

# Or run the course/development server
npm run dev
```

## Development

### Working on the library (`lang/`)

```bash
cd lang
# Pure ES modules, no build step
# Tests run directly with Node
npm test
```

### Working on the course (`course/`)

```bash
cd course
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run lint    # Run ESLint
```

## Features

**Language:**
- Lisp-like syntax with s-expressions
- Musical primitives (tone, harmony, sequence)
- ADSR envelopes
- Syntactic sugar: `-()` for sequence, `=()` for harmony
- Local bindings with `let`

**Synthesis Engine:**
- Generator-based audio (infinite streams of samples)
- Oscillators (sine, sawtooth)
- ADSR envelopes with gate time
- Filters (low-pass with envelope support)
- Gain control
- Composition (sequence, harmony, repeat)
- 48kHz sampling rate

**CLI:**
- `--play` flag for direct playback
- Stream raw PCM for piping to other tools
- Read `.lyre` files and generate audio

## Packages

### @lyre/core (lang/)

The standalone Lyre language and synthesis engine. See [lang/README.md](lang/README.md) for complete API documentation and examples.

### Lyre Course (course/)

An interactive educational platform for learning programming language implementation through building Lyre. Built with React and Vite.

## License

MIT
