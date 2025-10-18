# One sample at a time
<!-- slide-id: 39c37da1-b074-4ca6-9a7d-573183f6f664 -->

Awesome! We now have a function that can sample a wave for a given duration. However, it computes _all_ the samples first and returns them as a list.

This is not generally an issue, but let's assume we are sampling the Queen's Bohemian Rhapsody, which is about 6 minutes long, at 44.1 kHz rate. That means we need to compute `6 * 60 * 44100 = 15876000` samples and store them in memory before we can play anything. Storing ~15 million of anything in memory is generally not a good idea, so we need a different approach. What do we do?

Lucky for us, JS has a way to produce values on demand, one at a time, with the help of _generators_ and the `yield` keyword. Let's write the `countTo` function to produce numbers from 1 to `number`, one at a time.

```js
function* countTo(number) {
  for (let i = 1; i <= number; i = i + 1) {
    yield i;
  }
}
```
<!--[
  {"inputs": [1], "expected": [1]},
  {"inputs": [2], "expected": [1, 2]},
  {"inputs": [3], "expected": [1, 2, 3]}
]-->

Note the `*` after the `function` keyword on line 1 - that is what makes this function a generator. Inside the function, we use the `yield` keyword to produce values one at a time. It is similar to `return`, but instead of exiting the function, it pauses its execution, allowing it to be resumed later.

When we call a generator function, it does not execute its body immediately. Instead, it returns a handler _object_, on which we can then call the `next()` method to execute the function body until the next `yield` statement is encountered. The value produced by `yield` is returned as the `value` property of the object returned by `next()`.

Let's practice this new concept!

## Back

[Actually sampling](9%20Actually%20sampling.md)
