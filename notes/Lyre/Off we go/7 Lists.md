# Lists
<!-- slide-id: ff7f6da0-f607-4cb5-81eb-43d897e3b847 -->

Now that we know how to do something repeatedly, let us get back to our sampling problem. In the previous loop exercises we stored results in single variables. Sound samples, however, are not a single number, but rather a list of numbers.

Here's a useful function that works with lists - `zip` takes two lists and pairs their elements together:

```js
function zip(left, right) {
  let pairs = [];  // Start with an empty list

  for (let i = 0; i < left.length; i = i + 1) { // Loop over indices
    pairs = [...pairs, [left[i], right[i]]];    // Append a new pair to the accumulator
  }

  return pairs;
}
```
<!-- { "layout": "row", "tests": [
{"inputs": [[1, 2], [3, 4]], "expected": [[1, 3], [2, 4]]},
{"inputs": [["a", "b"], [1, 2]], "expected": [["a", 1], ["b", 2]]}]}
-->

Let's break down what's happening in `zip`:

We start with an empty list using square brackets: `pairs = []`. Lists can hold any values - numbers like `[1, 2, 3]`, strings like `["a", "b"]`, or even other lists.

The loop condition uses `left.length` to know when to stop. Every list has a `length` property that tells us how many elements it contains. Inside the loop, we grab individual elements with bracket notation: `left[i]` and `right[i]`.

The key operation happens on _line 5_. The spread operator `...` explodes the existing `pairs` list into its individual elements, then we create a new list with all those elements plus our new pair `[left[i], right[i]]` at the end.

>+ Notice how `[left[i], right[i]]` creates a nested list - a list containing two elements that becomes a single item in our result.

Let's practice these operations!

## Back

[Exercises on loops](6%20Exercises%20on%20loops.md)

## Next

[Exercises on lists](8%20Exercises%20on%20lists.md)

## Skip

[Actually sampling](9%20Actually%20sampling.md)
