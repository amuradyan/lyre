# Exercises on lists
<!-- slide-id: 69203ff3-cca4-4bf1-8cbf-48351b2e6330 -->
<!-- tags: exercise, lists -->

```js
function zip(left, right) {
  let pairs = [];  // Start with an empty list

  for (let i = 0; i < left.length; i = i + 1) { // Loop over indices
    pairs = [...pairs, [left[i], right[i]]];    // Append a new pair to the accumulator
  }

  return pairs;
}
```

----

Let's write a function that finds who is sitting in a specific seat at the movie theater.

```js
function whoSitsAt(seatNumber) {
  const seats = ["Alice", "Bob", "Carol", "Dave", "Eve"];

  return ??? // return the person sitting in the given seat number
}
```
<!-- [
{"inputs": [0], "expected": "Alice"},
{"inputs": [2], "expected": "Carol"},
{"inputs": [4], "expected": "Eve"}]
-->

----

Let's write a function that appends the shopping list items to the existing shopping cart.

```js
function addToCart(shoppingList) {
  const shoppingCart = ["milk", "eggs"];

  return ???;
}
```
<!-- { "layout": "row", "tests":[
{"inputs": [[]], "expected": ["milk", "eggs"]},
{"inputs": [["bread", "butter"]], "expected": ["milk", "eggs", "bread", "butter"]}]}
-->

----

Let's write a function that calculates your total grocery bill by adding up all the item prices.

```js
function calculateTotal(prices) {
  let total = ???;

  for (let i = 0; i < ???; i = i + 1) {
    total = ??? + prices[???];
  }

  return ???;
}
```
<!-- [
{"inputs": [[2.50, 3.00, 1.50]], "expected": 7.00},
{"inputs": [[5.00, 10.00]], "expected": 15.00},
{"inputs": [[1.25, 2.75, 3.00, 2.00]], "expected": 9.00}]
-->

##### Back: [Lists](7%20Lists.md)

##### Next: [Actually sampling](9%20Actually%20sampling.md)
