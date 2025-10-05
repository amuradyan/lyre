# Exercises on functions
<!-- slide-id: 9ecfb3b4-3003-4853-9f7b-4eb6ba532110 -->

Heres a function for reference:

```js
function square(number) {
  return number * number; // returning a value lets callers use it
}

square(3); // calling the function with 3 returns 9
```

----

Let's write a function that calculates the _speed_ of an object given the distance it traveled and the time it took, by dividing distance by time.

```js
??? speed(distance, ???) {
  ??? distance / ???; // Fill in the ??? to complete the function
}
```
<!-- [
{"inputs": [10, 2], "expected": 5},
{"inputs": [18, 3], "expected": 6},
{"inputs": [0, 10], "expected": 0}]
-->

----

Let's write a function that calculates _Return on Investment_ /ROI/ - how much profit or loss you made on an investment as a percentage, by subtracting the initial investment from the final value, then dividing by the initial investment.

```js
??? roi(initialValue, finalValue) {
  return (??? - initialValue) / ???; // Fill in the ??? to complete the function
}
```
<!-- [
{"inputs": [10, 12], "expected": 0.2},
{"inputs": [10, 8], "expected": -0.2},
{"inputs": [10, 10], "expected": 0},
{"inputs": [100, 150], "expected": 0.5}]
-->

----

Let's write a function that calculates the _redshift_ /z/ of a distant galaxy - how much its light has been stretched by the universe's expansion, by subtracting the observed wavelength from the emitted wavelength, then dividing by the emitted wavelength.

```js
??? // write the redshift function

redshift(400, 500); // should return 0.25
```
<!-- 0.25 -->

## Back

- [Where do I start?](notes/Lyre/1%20Where%20do%20I%20start.md)
