# Running Lyre code
<!-- slide-id: d820649b-0475-411c-a0e2-e698977d89e0 -->
<!-- tags: cli, node, shebang, file-io -->

Now let us tend to the command-line interface (CLI) for Lyre. I'd like to something like this:

> ./lyre sample.lyre | player ... -

Node.js can run JavaScript files from the command line, and we can make it a script witht  a `#!` at the top. To access the command-line arguments, we'll use `process.argv`, an array where the first two elements are the Node.js executable and the script path, and the rest are the arguments we pass. We'll take the third element as the path to a `.lyre` file and `stream()` it to get audio samples. Then we flush them into the standard output - more on this next.

```js
#!/usr/bin/env node
import { stream } from '../src/language/runner.js';

const filePath = process.argv[2];
const generator = stream(filePath);

for (const sample of generator) {
  // What do we do with samples?
}
```

The first line - `#!/usr/bin/env node` - is called a shebang. When you run `./lyre.js`, the operating system reads this line and knows to use `node` to execute the file.

Make the file executable, so we can run it directly:

```bash
chmod +x lyre.js
./lyre samples/twinkle.lyre
```

Let's figure out what to do with the samples next.

##### Back: [Reading Lyre files](Reading Lyre files.md)

##### Next: [Streaming samples](Streaming samples.md)
