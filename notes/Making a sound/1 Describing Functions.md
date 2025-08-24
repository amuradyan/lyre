# Describing Functions

We want to be able to describe the machine it's function, and tell it to perform /call the function/, and this is how we do it in JavaScript.

```js
function ???() {
  return "beep"; // returning a value lets callers use it
}

???();
```
<!-- {"expected": "beep"} -->

```js
function doublee(n) {
  return n * ???; // Fill in the ??? to double the input
}
```
<!-- [
  {"input": 3, "expected": 6},
  {"input": 1, "expected": 2},
  {"input": 8, "expected": 16}
] -->

```js
function pnduk() {
  return ???; // return an array of numbers representing a sound wave
}
```
<!-- {"expected": [1, 2, 3]} -->

!!NOTE TO SELF!!: if the student messes with the code, respond with a message about importance of the name actually describing the function and not just being a random word. Note that in real life nothing would stop him from doing it wrong.

Note the `()` after the name: it means "call this function". Calling `beep()` gives back data. This is very helpful because we will be doing a lot of manipulations with data.

Exercises:

 1. Come up with a name for the function that describes what it does, write `function say(word) { return word; }` then call `say("hello")` in the code above.

## Next

- [Motion Becomes a List (Arrays)](notes/Making%20a%20sound/2%20Motion%20Becomes%20a%20List.md)

## Back

- [Describing Sound](notes/Making%20a%20sound/0%20Describing%20Sound.md)
