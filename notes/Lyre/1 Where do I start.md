# Where do I start?
<!-- slide-id: 3e4b9f1c-7a2d-4c8e-9b5f-1d2c3e4f5a6b -->

Well, If I am going to instruct the computer stream music, first I need to be able to make it do anything at all. In JS, to describe the computer its' function, we use _functions_. Below is an example of a function that adds two numbers:

```js
function add(a, b) {
  return a + b; // returning a value lets callers use it
}

add(2, 3); // calling the function with 2 and 3 gives back 5
```

Lines 1-3 define the function, and line 5 calls it. The `return` statement on line 2 gives back a value to whoever called the function. The `+` operator adds two numbers as it usually does.

Let's do a few exercises to get familiar with functions.

Make the function below return the difference of its' two inputs

```js
function subtract(a, b) {
  ???; // Fill in the ??? to return the difference of a and b
}
```
<!-- [
{"inputs": [5, 3], "expected": 2},
{"inputs": [10, 4], "expected": 6},
{"inputs": [7, 7], "expected": 0}]
-->

Now call the `multiply` with arguments 5 and 3 to get the result:

```js
function multiply(a, b) {
  return a * b; // Fill in the ??? to return the product of a and b
}
???; // Call multiply with 5 and 3
```
<!-- {"expected": 15} -->

## Back

- [What I want to get?](0%20What%20I%20want%20to%20get.md)
