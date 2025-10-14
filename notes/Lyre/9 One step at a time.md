# One step at a time
<!-- slide-id: 39c37da1-b074-4ca6-9a7d-573183f6f664 -->

```js
function sumUpTo(number) {
  let sum = 0; // we will accumulate the sum here
  for (let i = 1; i <= number; i = i + 1) {
    sum = sum + i; // add the current number to the sum
  }
  return sum;
}
```

Let's take another look at the `sumUpTo` function above. Note how _all the computation has to be done first and accumulated in an in-memory storage /`sum` in this case/ for the function to be able to return it._

This is not generally an issue, but let's assume we are sampling the Queen's Bohemian Rhapsody, which is about 6 minutes long, at 44.1 kHz rate. That means we need to compute `6 * 60 * 44100 = 15876000` samples and store them in memory before we can play anything. Storing ~15 million of anything in memory is generally not a good idea, so we need a different approach.

Lucky for us, JS has a way to produce values on demand, one at a time, with the help of _generators_ and the `yield` keyword. Let's rewrite the `sumUpTo` function to produce numbers from 1 to `number`, one at a time.

```js
function* sumUpTo(number) {
  for (let i = 1; i <= number; i = i + 1) {
    yield i; // produce the current number
  }
}

const sumUpToThreeGenerator = sumUpTo(1);

sumUpToThreeGenerator.next().value;
```
<!--[
  {"inputs": [3], "expected": 1}
]-->

## Back

[Exercises on lists](8%20Exercises%20on%20lists.md)
