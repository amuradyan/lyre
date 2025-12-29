# Lyre 🪉

[![Tests](https://github.com/amuradyan/lyre/actions/workflows/test.yml/badge.svg)](https://github.com/amuradyan/lyre/actions/workflows/test.yml)

This repository accompanies a course on implementing a programming language from scratch. The idea is to explore how programming languages work by building a simple language to write music step by step.

For the looks and the mechanics of our language, we'll draw inspiration from an old and powerful family of programming languages - the LISPs, and we'll use JS to actually build and use the tool. We won't get into details with any of these languages, and, I hope, you'll be surprised to learn how far one can go in their experiments relying on a few fundamental ideas.

Here's how one might write the "Twinkle Twinkle Little Star" song in Lyre:

```lisp
(sequence
  (silence 500)

  ;  Twin-            kle,          twin-         kle,
  (tone C4 500) (tone C4 500) (tone G4 500) (tone G4 500)
  ;  Lit-             tle           star
  (tone A4 500) (tone A4 500) (tone G4 1000)
  ;  How              I             won-          der
  (tone F4 500) (tone F4 500) (tone E4 500) (tone E4 500)
  ;  what             you           are
  (tone D4 500) (tone D4 500) (tone C4 1000)

  (silence 500))
```

Starting from a single note, we'll then explore the ways of combining them, changing our system piece by piece, to be able to write more complex pieces. From there we shall look into the repetitive nature of music and the ability to name certain passages in a piece.

Lyre is the tool, that we'll be working on through the course. It is a lisp-like language for writing music. Below is the epic intro from Beethoven's 5th symphony in it:

```lisp
(sequence
    (harmony (tone G3 300) (tone Eb3 300))    ; da
    (harmony (tone G3 300) (tone Eb3 300))    ; da
    (harmony (tone G3 300) (tone Eb3 300))    ; da
    (harmony (tone Eb3 1500) (tone G2 1500))) ; DUMMMM
```

To describe a sound, Lyre provides the `tone` function, which takes a pitch and a duration. Certain pitches have names and are known to Lyre, so we can use them directly, e.g. `C4`, `E4`, `A4`, etc. The `harmony` combines multiple sounds into one, and `sequence` puts them one after another. The `;` character is used to add comments.

## Project Structure

This is a monorepo containing two packages:

- **`lang/`** - The `@lyre/core` library (language + synth engine)
- **`course/`** - The interactive course/educational platform

## Getting Started

```bash
# Install dependencies for all packages
npm install

# Run the development server
npm run dev

# Build the course
npm run build
```

## Development

### Working on the library (`lang/`)

```bash
cd lang
# The library is pure ES modules with no build step
# Tests can be run directly with Node
```

### Working on the course (`course/`)

```bash
cd course
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run lint    # Run ESLint
```

## Packages

### @lyre/core (lang/)

The core Lyre language and synthesis engine. See [lang/README.md](lang/README.md) for API documentation.

Features:

- Lisp-like language with s-expressions
- Generator-based audio synthesis
- Oscillators (sine, sawtooth)
- ADSR envelopes
- Filters (low-pass, filter envelopes)
- Composition functions (sequence, harmony, repeat)

### Lyre Course (course/)

An interactive educational platform for learning programming through building a musical Lisp. Built with React and Vite.

## License

MIT
