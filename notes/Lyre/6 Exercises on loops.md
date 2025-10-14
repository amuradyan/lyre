# Exercises on loops
<!-- slide-id: e4e3a452-5dc9-4934-8c75-e849ea941f16 -->

Here's the reference loop for summing numbers:

```js
function sumTo(number) {
  let sum = 0;
  for (let i = 1; i <= number; i = i + 1) {
    sum = sum + i;
  }
  return sum;
}
```

----

Let's write a function that calculates _compound interest_ - how much money you'll have after saving for several years, where each year your balance grows by a percentage rate.

```js
function savings(principal, rate, years) {
  let amount = principal;

  ??? (let i = ???; i < ???; i = ???) {
    amount = amount * (1 + ???);
  }

  return ???;
}
```
<!-- [
{"inputs": [100, 0.8, 1], "expected": 180},
{"inputs": [1000, 0.2, 1], "expected": 1200},
{"inputs": [100, 0.5, 2], "expected": 225}]
-->

----

Let's write a function that counts _flights of stairs_ in a building - how many complete flights there are given the total stairs and stairs per flight.

```js
function countFlights(totalStairs, stairsPerFlight) {
  ??? flights = 0;

  for (??? i = stairsPerFlight; ??? <= totalStairs; i = i + ???) {
    flights = ??? + 1;
  }

  return flights;
}
```
<!-- [
{"inputs": [60, 15], "expected": 4},
{"inputs": [100, 12], "expected": 8},
{"inputs": [30, 10], "expected": 3}]
-->

----

Let's write a function that calculates _bacterial population_ - how many bacteria there will be after N hours if the population doubles every hour.

```js
??? bacteriaCount(initial, hours) {
  // population doubles each hour
  // your code here
}
```
<!-- [
{"inputs": [100, 5], "expected": 3200},
{"inputs": [1, 10], "expected": 1024},
{"inputs": [50, 3], "expected": 400}]
-->

## Back

[Repetitions](5%20Repetitions.md)

## Next

[Lists](7%20Lists.md)
