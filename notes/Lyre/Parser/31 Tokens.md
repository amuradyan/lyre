# Tokens
<!-- slide-id: 24e725ab-8f0c-44cb-a7b0-8f9fd66ca794 -->

To parse code, we first need to break it into meaningful pieces called *tokens*. Think of it like breaking a sentence into words - `"a list of words"` becomes `["a", "list", "of", "words"]`.

To do this, we need to scan through the code character by character. We can think of code as a long *string* with newlines and spaces. In JavaScript, strings are sequences of characters enclosed in quotes - either single `'hello'` or double `"hello"`. We can treat strings like arrays, accessing individual characters by index:

```js
const code = "(tone C4 500)"
code[0]  // "("
code[1]  // "t"
```

We can also loop through them:

```js
for (const char of code) {
  // processes each character: "(", "t", "o", "n", "e", " ", ...
}
```

As we scan, we'll build up tokens by concatenating characters with `+`:

```js
let token = ""
token = token + "t"
token = token + "o"  // token is now "to"
```

When we hit a space or parenthesis, we know the current token is complete and we can add it to our list.

## Back

[Reading code](30%20Reading%20code.md)

## Next

[Exercises on strings](32%20Exercises%20on%20strings.md)

## Skip

[Break it down](33%20Break%20it%20down.md)
