# More exercises on strings
<!-- slide-id: bbb6f0e0-9ef9-41ab-ba78-7591d8040b88 -->

Generate initials from a full name /first letter of each word/.

```js
function getInitials(fullName) {
  const words = fullName.???(" "); // #! Split by space
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

  return imageFormats.includes(???); // #! Do formats include extensions?
}
```
<!-- [
{"inputs": ["photo.jpg"], "expected": true},
{"inputs": ["document.pdf"], "expected": false},
{"inputs": ["avatar.png"], "expected": true}]
-->

## Back

[Exercises on strings](32%20String%20operations.md)
