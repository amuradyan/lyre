# Lists
<!-- slide-id: ff7f6da0-f607-4cb5-81eb-43d897e3b847 -->

Now, that we know how to do something repeatedly, let us get back to our sampling problem. In the previous loop exercises we were able to store the result in a single variable. Sound samples, however, are not a single number, but rather a list of numbers. How do we  do that?

Turns out JS has a built-in data structure for storing lists of things and it looks like this:

```js
const emptyList = [];
const numbers1to5 = [1, 2, 3, 4, 5];
```

One way of appending an item to a list is with the spread operator `...`:

```js
function appendToList(list, element) {
  return [...list, element];
}
```
<!-- [
{"inputs": [[], 1], "expected": [1]},
{"inputs": [[1, 2], 3], "expected": [1, 2, 3]}]
-->

The code above essentially explodes the original list into its elements and then creates a new list with those elements plus the new one at the end. Prepending an element to a list can be done in a similar way - by spreading the original list after the new element.

> Note that `appendToList` does not modify the original list, but rather creates a new one with the added element.

Тo access an element in a list, we use its index position in the list, starting from `0`.

```js
function getElementAt(list, index) {
  return list[index];
}
```
<!-- [
{"inputs": [[1, 2, 3], 0], "expected": 1},
{"inputs": [[1, 2, 3], 2], "expected": 3},
{"inputs": [[42], 0], "expected": 42}]
-->

Let's do some exercises with lists, shall we?

## Back

[Exercises on loops](6%20Exercises%20on%20loops.md)

## Next

[Exercises on lists](8%20Exercises%20on%20lists.md)
