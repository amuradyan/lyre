# Repetitions
<!-- slide-id: 9a7a480a-5fa6-4c3b-b048-f33e8bc8aae1 -->

One of the ways to repeat doing something in JS is the _iteration_ - more specifically, the `for` loop. Here's how to sum numbers from 1 to a given number with a loop.

```js
function sumUpTo(number) {
  let sum = 0; // we will accumulate the sum here

  for (let i = 1; i <= number; i = i + 1) {
    sum = sum + i; // add the current number to the sum
  }

  return sum;
}
```
<!--[
  {"inputs": [10], "expected": 55},
  {"inputs": [5], "expected": 15},
  {"inputs": [1], "expected": 1}
]-->

We are already familiar with the `function` and `return` keywords. The new things here are the `let` on line 2 and the `for` loop on line 4.

The `let` keyword is used to declare a named storage for a value. Unlike `const`, a `let` storage can be reassigned to a different value later. We use it here to create a `sum` storage that starts at 0 and will hold the accumulated sum of numbers.

The `for` loop on line 4 is used to repeat a block of code multiple times. It consists of three parts:

- Initialization - `let i = 1` initializes the loop step counter `i` to 1.
- Condition - `i <= 10` is the condition that keeps the loop running as long as it is true.
- Increment - `i = i + 1` updates the loop counter `i` by adding 1 to it after each iteration.

Inside the loop, we add the current value of `i` to `sum`. When `i` exceeds 10, the loop stops, and we return the final value of `sum`.

Let's do a few exercises to get familiar with loops.

##### Back: [Sampling a wave](4%20Sampling%20a%20wave.md)

##### Next: [Exercises on loops](6%20Exercises%20on%20loops.md)

##### Skip: [Lists](7%20Lists.md)
