# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lyre is an interactive JavaScript learning platform that teaches programming language implementation through building a musical Lisp called "Shvi." The project combines educational content with hands-on language development, using music synthesis as a motivating domain.

## Architecture

### Frontend (React + Vite)
- **Location**: `react/` - React 19.1.0 application with Vite 7.0.4
- **Key Component**: `Slide.jsx` - Interactive presentation system with Monaco Editor integration
- **Styling**: Tailwind CSS with custom fonts (Nunito, IBM Plex Mono)
- **Port**: Development server runs on port 8000

### Core Language (SLIm)
- **Location**: `SLIm/` - Deno-based Shvi interpreter
- **Main File**: `sintez.js` (437 lines) - Complete Lisp interpreter with audio synthesis
- **Key Functions**: `tokenize()`, `evaluate()`, `generatePCM()`, musical functions like `tone()`, `sequence()`, `parallel()`

### Educational Content
- **Location**: `notes/` - Structured curriculum in Markdown
- **Approach**: Step-by-step progression through language implementation concepts
- **Method**: Each git branch represents a learning milestone

## Development Commands

### React Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Find and execute *.test.js files
```

### Shvi Language
```bash
./shvi fixtures/still-dre.shvi    # Execute Shvi programs
deno SLIm/sintez.js              # Run interpreter directly
```

### Static Site
```bash
deno static/server.js            # Serve static HTML content
```

## Key Technical Details

### File System Integration
- Vite configured for parent directory access via `fs.allow: [".."]`
- Global `__WORKSPACE_ROOT__` variable for cross-component file paths
- Slide component loads educational materials from filesystem

### Audio Synthesis
- WAV file generation with PCM samples using sine waves
- Cross-platform audio playback (Linux/macOS/Windows)
- Musical note definitions built into language environment

### Language Features
The Shvi language supports:
- Basic sounds: `(tone C4 500)` - pitch and duration
- Composition: `(sequence ...)`, `(parallel ...)` - temporal and harmonic combination
- Definitions: `(define theme ...)` - named musical sections
- Repetition: `(repeat 3 melody)` - phrase repetition

### Testing Strategy
- Custom test runner for Shvi language features
- Test files use `*.test.js` pattern in SLIm directory
- Educational progression validated through working implementations

## Development Practices

- **Git Workflow**: Emoji commits for clarity (:broom:, :pencil:, :eye:, etc.)
- **Branch Strategy**: Each branch represents a learning step in curriculum
- **Code Architecture**: Modular separation between UI, language core, and content
- **Educational Philosophy**: JavaScript concepts introduced only when needed for implementation

## Important Files

- `SLIm/sintez.js` - Core interpreter implementation
- `react/src/components/slide/Slide.jsx` - Educational presentation system
- `notes/Curriculum Progression.md` - Detailed learning roadmap
- `react/vite.config.js` - Build configuration with filesystem permissions
- no comments in code