# 🎵 Lyre

**Learn JavaScript by building a musical programming language**

Lyre is an interactive educational platform that teaches JavaScript concepts through the creation of **Shvi** — a musical Lisp dialect for composing and generating audio. Instead of traditional coding exercises, you'll build a complete language interpreter while learning fundamental programming concepts.

## 🎯 What You'll Build

By the end of Lyre's curriculum, you'll have implemented:

- **Tokenizer**: Parse musical expressions like `(tone C4 500)`
- **Evaluator**: Execute nested function calls and variable definitions
- **Audio Engine**: Generate PCM samples and synthesize music
- **Language Features**: Functions, sequencing, parallel composition, and repetition

## 🏗️ Project Structure

```
lyre/
├── react/          # 🚀 Current prototype (React + Vite)
├── static/         # 📄 Legacy HTML-based version
├── notes/          # 📚 Curriculum content and progression
├── SLIm/          # 🔍 Reference implementation (git-ignored)
└── README.md
```

### Development Focus

- **`react/`** - Active development, modern React-based learning platform
- **`static/`** - Legacy version with simple Deno server
- **`notes/`** - Structured curriculum mapping JavaScript concepts to language features
- **`SLIm/`** - Complete reference implementation for comparison

## 🚀 Quick Start

### React Version (Primary)

```bash
cd react
npm install
npm run dev
```

Navigate to `http://localhost:8000` to start the interactive curriculum.

### Static Version (Legacy)

```bash
deno run --allow-read --allow-net static/server.js
```

## 🎓 Learning Progression

The curriculum introduces JavaScript concepts incrementally:

| Step | JavaScript Concepts | Shvi Features |
|------|-------------------|---------------|
| **01** | `const/let`, functions, loops, `Math` API | Raw tone generation |
| **02** | `Array.from`, `Number.parseFloat`, `Symbol.for` | String tokenization |
| **03** | Recursion, destructuring, `typeof`, `Array.isArray` | Expression evaluation |
| **04** | Closures, typed arrays (`Int16Array`) | Audio sequencing |
| **05** | `Math.max`, `reduce`, `map` | Parallel composition |
| **06** | Nested loops, accumulation patterns | Musical repetition |
| **07** | `Array.find`, error handling | Environment lookup |
| **08** | Environment mutation, control flow | Variable definitions |

Each step builds on previous concepts while introducing new JavaScript features naturally through musical programming needs.

## 🎼 Example Shvi Programs

```lisp
; Play a simple tone
(tone 440 1000)

; Create a melody
(sequence 
  (tone C4 500)
  (tone D4 500)
  (tone E4 500))

; Play a chord
(parallel
  (tone C4 1000)
  (tone E4 1000)
  (tone G4 1000))

; Define and use musical phrases
(define theme (sequence (tone C4 250) (tone E4 250)))
(repeat 4 theme)
```

## 🛠️ Development Commands

### React Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Execute test files
```

### Troubleshooting
If `npm install` fails:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Key Features

- **Interactive Code Editor**: Monaco-based editor with syntax highlighting
- **Live Testing**: Automatic validation of user implementations
- **Progressive Curriculum**: Each lesson builds on previous concepts
- **Audio Generation**: Real PCM synthesis and WAV output
- **Functional Programming**: Emphasizes declarative code patterns
- **Browser Navigation**: Clean URLs and history integration

## 🧠 Educational Philosophy

Lyre teaches JavaScript through **problem-driven learning**:

1. **Musical Context**: Every concept serves a musical purpose
2. **Incremental Complexity**: Features introduced only when needed
3. **Hands-on Building**: Learn by implementing, not just reading
4. **Functional Style**: Emphasizes pure functions and immutability
5. **Real Output**: Generate actual audio files you can play

## 📚 Curriculum Resources

- **`notes/Curriculum Progression.md`** - Detailed step-by-step breakdown
- **`notes/Making a sound/`** - Individual lesson content
- Interactive slides with embedded code challenges
- Automatic test validation for each implementation

## 🤝 Contributing

The project uses modern development practices:
- Functional programming patterns preferred over imperative
- Pure functions and immutable data structures
- Comprehensive testing for language features
- Clean, declarative code style

---

**Start your journey**: `cd react && npm run dev`

Learn JavaScript. Build a language. Make music. 🎵