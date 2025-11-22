# Exercises on strings
<!-- slide-id: bd9cf0ff-74ba-4352-8c6b-8b3f56266b53 -->

Count the characters in a text message to check if it fits within the 160-character SMS limit. Strings have a `.length` property that tells you how many characters they contain.

```js
function messageLength(text) {
  return text.???; // #! try the `length` property of text, just like lists
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
  const parts = filename.???("."); // #! `split` by '.'
  const lastIndex = ???; // #! remember the index is 0 based

  return parts[lastIndex];
}
```
<!-- [
{"inputs": ["photo.jpg"], "expected": "jpg"},
{"inputs": ["doc.backup.pdf"], "expected": "pdf"},
{"inputs": ["archive.tar.gz"], "expected": "gz"}]
-->

----

Generate initials from a full name /first letter of each word/.

```js
function getInitials(fullName) {
  const words = fullName.???(" "); // #! `split` by space
  let initials = "";

  for (const word of words) {
    initials = initials + ???; // #! Append the first letter to initials
  }

  return initials;
}
```
<!-- [
{"inputs": ["John Doe"], "expected": "JD"},
{"inputs": ["Alice Marie Smith"], "expected": "AMS"},
{"inputs": ["Bob"], "expected": "B"}]
-->

----

Check if a filename is an image file /ends with .jpg, .png, or .gif/.

```js
function isImageFile(filename) {
  const parts = filename.split(".");
  const extension = parts[???]; // #! Take the last part
  const imageFormats = ["jpg", "png", "gif"];

  return imageFormats.includes(???); // #! Check whether the formal list includes` the extension?
}
```
<!-- [
{"inputs": ["photo.jpg"], "expected": true},
{"inputs": ["document.pdf"], "expected": false},
{"inputs": ["avatar.png"], "expected": true}]
-->

## Back

[Tokens](31%20Tokens.md)

## Next

[Break it down](33%20Break%20it%20down.md)
