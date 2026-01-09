# From browser to command line
<!-- slide-id: 541ac44a-4cf3-4519-9372-60167b1ecb48 -->
<!-- tags: architecture, node, cli, design -->

Lyre runs in the browser. We type code into an editor, click play, and hear the sound. I want to be able to play Lyre samples from the command line - something like this:

```bash
./lyre samples/twinkle.lyre | player ... -
```

The browser and Node.js both run JavaScript, but they have different I/O systems. The browser has the DOM, buttons, audio APIs. Node.js has file systems, stdin/stdout, process management. We can't just take the browser code and run it in a terminal.

The core of Lyre - tokenization, evaluation, sample generation - is still universal though. In browser we have a `play()` function that takes code directly. For the CLI, we need a `stream()` function that reads a file, tokenizes it, evaluates it, and yields samples. Then we need a thin wrapper that reads those samples and writes them somewhere useful.

What we need to do is basically this:

```
Browser:     editor → tokenize → evaluate → generate → play   /via AudioAPI/
                         ↓          ↓          ↓
CLI:          file  → tokenize → evaluate → generate → stdout /e.g. | ffplay -/
```

Same core, different endpoints.

##### Back: [Drafts](../drafts.md)

##### Next: [Reading Lyre files](Reading Lyre files.md)
