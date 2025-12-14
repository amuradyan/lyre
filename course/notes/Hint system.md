# Hint System Design

## Problem Statement

Educational code blocks in Lyre slides contain exercises where students fill in `???` placeholders to complete working code. These exercises need contextual hints to guide students toward the solution - what variable name to use, what value to return, which function to call.

Currently, hints would need to be either always visible in the code /defeating the learning challenge/, placed in prose above the code /breaking the connection between hint and location/, or omitted entirely /leaving students stuck without guidance/. None of these options support the pedagogical goal: let students attempt the exercise independently first, then reveal hints progressively when needed.

## Benefits We're Deprived Of

Self-directed learning becomes impossible. Students cannot choose their own challenge level. Advanced students who understand the concept are forced to read scaffolding they don't need, creating unnecessary friction. Struggling students have no way to access help when stuck, leading to frustration and abandoned exercises.

Progressive disclosure - showing information just when it's needed - is a cornerstone of effective learning. Students should encounter the problem, form their own mental model through attempted solutions, then access hints to validate or correct their understanding. Always-visible hints short-circuit this process. The student reads the answer before thinking through the problem.

Cognitive load matters. When hints appear alongside code, they create visual noise. The scaffolding obscures the structure. Students struggle to distinguish between the actual code they're learning and the commentary about it. Clean code is easier to understand.

Testing comprehension becomes difficult. After completing an exercise with hints visible, students cannot verify they've truly internalized the solution. They might have leaned on the hints without understanding why. No way to self-test means no way to build confidence.

Pacing control disappears. Different students need different amounts of guidance. Some breeze through with minimal hints. Others need detailed explanation for every step. A toggle gives students control over their learning pace. They can start without hints, get stuck, reveal one hint, try again, reveal another if needed. This gradual unveiling matches how humans actually learn.

## Proposed Solution

Store hints as comments in markdown source files using special patterns. For brief pointers, use single-line comments:

```js
const x = ???; // #! define as amplitude
```

For longer explanations that need context, use multi-line comments:

```js
/* #! The oscillator yields samples indefinitely.
   Use .next().value to get each sample. */
const sample = ???;
```

Add a toggle button /eye icon/ to code blocks. When enabled, hints appear. When disabled, they're hidden. The toggle state persists per-slide in localStorage, defaulting to hidden.

This approach treats hints as first-class content in the curriculum, not separate metadata. Slide authors write hints directly where they belong - adjacent to the code they explain. Single source of truth.

## Technicalities

The system needs to understand two hint patterns. Lines ending with `// #! <text>` contain inline hints. Multi-line comments matching `/* #! ... */` contain block hints. During markdown parsing, we extract hint metadata from code blocks.

For single-line hints, the representation is straightforward: each line has code and an optional hint at its end. The internal structure pairs them: `{ code: "const x = ???;", hint: "define as amplitude" }`.

Multi-line hints anchor to the first non-blank code line that follows them. When we parse:

```js
/* #! The oscillator yields samples indefinitely.
   Use .next().value to get each sample. */

const sample = ???;
```

The hint block anchors to `const sample = ???;`. The blank line between hint and code is skipped. This creates a natural connection: the hint explains what comes next.

Per-slide hint visibility state lives in localStorage under the slide ID. This is independent of user code edits, which are already tracked separately. Students can toggle hints without affecting their progress.

### The Merge Challenge

Consider this scenario: A student hides hints and sees `const x = ???;` They edit it to `const x = 0.8;` Then they toggle hints on. Where does the hint go? The line changed.

We need to match edited lines back to their originals to reattach hints. This is the merge problem.

The solution uses a two-pointer approach. One pointer tracks position in the original code /with hints/, another tracks position in the edited code /without hints/. As we iterate through the original, we consume lines from the edited version only when we encounter actual code - not when we encounter hint comments.

For single-line hints, we extract tokens from the original line - variable names, operators, keywords. From `const x = ???;` we get `['const', 'x', '=']`. Then we check similarity with the edited line. From `const x = 0.8;` we get `['const', 'x', '=', '0.8']`. Three out of three original tokens are present. Similarity is 100%.

If similarity exceeds 60%, we reattach the hint. Typical `???` replacements preserve most tokens, so this is safe. Students usually replace the placeholder with a value, not restructure the entire line.

When similarity is below 60%, the system performs look-ahead matching: it searches the next 10 edited lines for a better match. If a line with ≥60% similarity is found, all intervening lines are emitted without hints, then the hint attaches to the matching line. This handles cases where `???` expands into multi-line constructs - the hint "jumps over" the expansion to find its actual target. If no good match is found within the look-ahead window, the hint is dropped and the current line is emitted without it.

Multi-line hints use a simpler strategy: they always attach to the next edited line, regardless of similarity. The pedagogical reasoning is that block hints explain what comes next. Even if the student changed the code significantly, the hint provides useful context for that section. After emitting the block hint, we skip any blank lines in both original and edited versions to prevent blank line accumulation across multiple toggles.

Line count validation compares the stripped original /hints removed/ against the edited version. If they differ by more than ten lines, we show a dialog: "Code structure changed. Reset to original?" This threshold allows `???` placeholders to expand naturally into multi-line constructs /arrays, objects, function calls/ without triggering false warnings, while still catching cases where students add or remove significant chunks of code.

If more than 30% of inline hints fail similarity matching, we also prompt for reset. This indicates the student has restructured the code enough that automated hint placement becomes unreliable.

## Cons

Source files gain `// #!` and `/* #! ... */` comments throughout. This is visible to slide authors and in version control diffs. The benefit is single-source simplicity - hints live where they belong - but the cost is markdown clutter.

The line-matching algorithm requires careful testing. Edge cases exist where automated matching fails and requires user intervention. The token-based similarity works well for typical `???` replacements but struggles with restructuring.

If a student significantly rewrites code - reordering lines, adding loops, extracting functions - the system prompts for reset. This is acceptable because such rewrites indicate the student has moved beyond needing the original hints, but it does interrupt flow.

Two hint patterns create asymmetry. Single-line hints check similarity before reattaching. Multi-line hints always reattach. This difference stems from their pedagogical roles: inline hints annotate specific expressions and may not apply if the expression changes, while block hints provide context for a section and remain relevant even after edits.

Author discipline is required. Slide authors must write hints in consistent format. Typos in `// #!` or `/* #! ... */` cause hints to be treated as regular comments. Tooling could validate hint patterns during build.

The merge strategy uses heuristics: 60% similarity threshold for inline hints, 10-line look-ahead window for finding better matches, 30% divergence limit for prompting reset, 10-line difference tolerance for structure changes. These are tuned to typical student behavior in our exercises - the 10-line thresholds specifically accommodate natural expansion of `???` placeholders into multi-line code. Different editing patterns might need different thresholds, but exposing these as configuration would add UI complexity.
