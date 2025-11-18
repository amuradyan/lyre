# Exercises on strings
<!-- slide-id: bd9cf0ff-74ba-4352-8c6b-8b3f56266b53 -->

Extracting the first word from a sentence:

```js
function firstWord(sentence) {
  const words = sentence.split(" ");

  return words[0];
}

firstWord("hello world")  // "hello"
```

----

Count the characters in a text message to check if it fits within the 160-character SMS limit. Strings have a `.length` property that tells you how many characters they contain.

```js
function messageLength(text) {
  return text.???; // #! call the length method on text
}
```
<!-- [
{"inputs": ["Hello there!"], "expected": 12},
{"inputs": [""], "expected": 0}]
-->

----

Extract the file extension from a filename /the part after the last dot/. Strings have a `.split()` method that breaks them into an array of parts based on a separator.

```js
function getExtension(filename) {
  const parts = filename.???("."); // #! split by '.'
  const lastIndex = ???; // #! remember the index is 0 based

  return parts[lastIndex];
}
```
<!-- [
{"inputs": ["photo.jpg"], "expected": "jpg"},
{"inputs": ["doc.backup.pdf"], "expected": "pdf"},
{"inputs": ["archive.tar.gz"], "expected": "gz"}]
-->

## Back

[Tokens](31%20Tokens.md)

## Next

[More exercises on strings](33%20More%20exercises%20on%20strings.md)
