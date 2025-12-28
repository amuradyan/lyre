# Running Lyre Code
<!-- slide-id: d820649b-0475-411c-a0e2-e698977d89e0 -->
<!-- tags: cli, node, shebang, file-io -->

We have `.lyre` files with musical code, but no way to run them outside the browser. We need a command-line tool - something you can call from the terminal to execute Lyre programs.

Node.js can run JavaScript files from the command line. If we write a script that reads a Lyre file, tokenizes it, and evaluates it, we can make our language runnable.

Create a file called `lyre.js`:

```js
#!/usr/bin/env node
import { stream } from '../src/language/runner.js';

const filePath = process.argv[2];
const generator = stream(filePath);

for (const sample of generator) {
  // What do we do with samples? We'll figure that out next.
  console.log(sample);
}
```

The first line - `#!/usr/bin/env node` - is called a shebang. When you run `./lyre.js`, the operating system reads this line and knows to use `node` to execute the file. Without it, the OS would try to run the file as a shell script.

The `process.argv` array contains command-line arguments. `argv[0]` is the `node` executable, `argv[1]` is the script path, and `argv[2]` is the first argument we pass - in this case, the path to a `.lyre` file.

The `stream()` function from `runner.js` reads the file, tokenizes the code, and returns a generator that yields audio samples. Right now we're just logging them, which isn't useful - but it proves the CLI works.

Make the file executable:

```bash
chmod +x lyre.js
```

Now you can run:

```bash
./lyre.js samples/twinkle.lyre
```

You'll see a stream of numbers - the audio samples. But we can't hear them yet. Numbers aren't sound - they need to be converted to a format an audio player understands.

----

Implement the basic CLI tool:

1. Create `bin/lyre.js` with the shebang line
2. Read the file path from command-line arguments
3. Use `stream(filePath)` to get the sample generator
4. For now, just log the first 10 samples to verify it works

Test with a simple Lyre file to make sure samples are being generated.

##### Back: [Previous slide]

##### Next: [Streaming Samples]
