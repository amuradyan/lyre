# If this, then that
<!-- slide-id: 954aa3e6-a073-4835-a251-3201b70bde26 -->
<!-- tags: conditionals, if-else -->

Sometimes we want our code to do different things depending on conditions. JavaScript gives us the `if-else` statement for this, and it's stackable. The basic pattern is:

```js
if (conditionA) { <code> }
else if(conditionB) { ... }
else if(conditionC) { ... }
else { ... }
```

----

Calculate the coffee cost. If the customer has a loyalty card, apply a $0.75 discount.

```js
function coffePrice(hasLoyaltyCard, cost) {
  if(???) {
    return ??? - 0.75;
  }

  // Try putting me in an else block. I should still work
  return cost;
}
```
<!-- [
{"inputs": [true, 4.50], "expected": 3.75},
{"inputs": [false, 4.50], "expected": 4.50}]
-->

>+ Note the multiple returns on lines 3 and 7. You can do this in JS and almost any other language and sometimes it's just easier to early exit. You can also wrap the `return cost` in an `else` block. Try that.

----

Calculate delivery days based on order total: under $25 takes 7 days, $25-$75 takes 3 days, over $75 takes 1 day.

```js
function deliveryDays(orderTotal) {
  let days;

  ??? (orderTotal < 25) {
    days = ???;
  } ??? {
    days = 3;
  } ??? {
    days = ???;
  }

  return days;
}
```
<!-- {"layout": "oneline", "tests": [
{"inputs": [20], "expected": 7},
{"inputs": [50], "expected": 3},
{"inputs": [100], "expected": 1},
{"inputs": [25], "expected": 3},
{"inputs": [75], "expected": 3}]}
-->

##### Back: [That clicking sound](14%20That%20clicking%20sound.md)

##### Next: [Smoooth Operator](16%20Smoooth%20operator.md)
