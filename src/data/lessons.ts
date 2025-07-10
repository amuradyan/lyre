export interface Test {
  n: number;
  expected: number | boolean;
}

export interface Lesson {
  title: string;
  description: string;
  definition: string;
  note: string;
  tip: string;
  examples: string;
  task: string;
  requirements: string[];
  initialCode: string;
  tests: Test[];
  testFunction: string;
}

export const lessons: Lesson[] = [
  {
    title: "Factorial Calculator",
    description:
      "Write a function that calculates the factorial of a non-negative integer n, denoted as n!",
    definition:
      "The factorial of a non-negative integer n is the product of all positive integers less than or equal to n.<br>n! = n × (n-1) × (n-2) × ... × 2 × 1",
    note: "Note: By definition, 0! = 1 and 1! = 1",
    tip:
      "Think about how you can use recursion or a loop to multiply the numbers. Remember to handle the special case of 0!",
    examples: `5! = 5 × 4 × 3 × 2 × 1 = 120
3! = 3 × 2 × 1 = 6
0! = 1`,
    task: "Complete the <code>factorial</code> function below. The function:",
    requirements: [
      "Takes a non-negative integer n as input",
      "Returns the factorial of n (n!)",
      "Should handle inputs from 0 to 10",
    ],
    initialCode: `function factorial(n) {
  // your code here
}`,
    tests: [
      { n: 0, expected: 1 },
      { n: 1, expected: 1 },
      { n: 3, expected: 6 },
      { n: 5, expected: 120 },
      { n: 7, expected: 5040 },
      { n: 10, expected: 3628800 },
    ],
    testFunction: "factorial",
  },
  {
    title: "Fibonacci Sequence",
    description:
      "Write a function that returns the nth number in the Fibonacci sequence",
    definition:
      "The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones.<br>F(n) = F(n-1) + F(n-2)",
    note: "Note: F(0) = 0 and F(1) = 1",
    tip:
      "You can solve this using recursion, iteration, or memoization. Consider the efficiency of your approach!",
    examples: `F(0) = 0
F(1) = 1
F(2) = 1
F(3) = 2
F(4) = 3
F(5) = 5`,
    task: "Complete the <code>fibonacci</code> function below. The function:",
    requirements: [
      "Takes a non-negative integer n as input",
      "Returns the nth Fibonacci number",
      "Should handle inputs from 0 to 10",
    ],
    initialCode: `function fibonacci(n) {
  // your code here
}`,
    tests: [
      { n: 0, expected: 0 },
      { n: 1, expected: 1 },
      { n: 2, expected: 1 },
      { n: 3, expected: 2 },
      { n: 4, expected: 3 },
      { n: 5, expected: 5 },
      { n: 6, expected: 8 },
      { n: 7, expected: 13 },
      { n: 8, expected: 21 },
      { n: 10, expected: 55 },
    ],
    testFunction: "fibonacci",
  },
  {
    title: "Prime Number Checker",
    description: "Write a function that determines if a given number is prime",
    definition:
      "A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.<br>The first few prime numbers are: 2, 3, 5, 7, 11, 13...",
    note: "Note: 1 is not considered a prime number",
    tip:
      "You only need to check divisors up to the square root of the number. Also, 2 is the only even prime number!",
    examples: `isPrime(2) = true
isPrime(3) = true
isPrime(4) = false
isPrime(17) = true
isPrime(25) = false`,
    task: "Complete the <code>isPrime</code> function below. The function:",
    requirements: [
      "Takes a positive integer n as input",
      "Returns true if n is prime, false otherwise",
      "Should handle edge cases like 1 and 2",
    ],
    initialCode: `function isPrime(n) {
  // your code here
}`,
    tests: [
      { n: 1, expected: false },
      { n: 2, expected: true },
      { n: 3, expected: true },
      { n: 4, expected: false },
      { n: 17, expected: true },
      { n: 25, expected: false },
      { n: 29, expected: true },
      { n: 100, expected: false },
    ],
    testFunction: "isPrime",
  },
];
