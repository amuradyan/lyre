# Where do I start?
<!-- slide-id: 3e4b9f1c-7a2d-4c8e-9b5f-1d2c3e4f5a6b -->

Well, If I am going to instruct the computer to stream music, I need to know how to make it do anything at all. In JS, to describe the computer its' function, we use _functions_. Below is an example of a function that calculates the area of a rectangle given its' width and height.

```js
function area(width, height) {
  return width * height; // returning a value lets callers use it
}

area(2, 3); // calling the function with 2 and 3 returns 6
```

Lines 1-3 define the function, and line 5 calls it. `area` is its' name and `width` and `height` are the names of the values it will be passed, known otherwise as _arguments_. The `*` operator multiplies two numbers and the `return` statement on line 2 returns the value to whoever called the function.

Let's do a few exercises to get familiar with functions.

## Back

- [What I want to get?](0%20What%20I%20want%20to%20get.md)

## Next

- [Exercises on functions](2%20Exercises%20on%20functions.md)

## Skip

- [How do I describe a sound to a machine?](4%20How%20do%20I%20describe%20a%20sound%20to%20a%20machine.md)
