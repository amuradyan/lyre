import './App.css';
import SlideExperimental from './SlideExperimental.jsx';

const factorialProblem = {
  title: 'Factorial Calculator',
  description: 'Write a function that calculates the factorial of a non-negative integer n, denoted as n!',
  definition: {
    text: 'The factorial of a non-negative integer n is the product of all positive integers less than or equal to n.',
    formula: 'n! = n × (n-1) × (n-2) × ... × 2 × 1',
    note: 'Note: By definition, 0! = 1 and 1! = 1'
  },
  tip: 'Think about how you can use recursion or a loop to multiply the numbers. Remember to handle the special case of 0!',
  examples: [
    '5! = 5 × 4 × 3 × 2 × 1 = 120',
    '3! = 3 × 2 × 1 = 6',
    '0! = 1'
  ],
  task: {
    description: 'Complete the factorial function below. The function:',
    requirements: [
      'Takes a non-negative integer n as input',
      'Returns the factorial of n (n!)',
      'Should handle inputs from 0 to 10'
    ]
  }
};

export default function App() {
  return (
    <div className="font-sans bg-gray-100 text-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <SlideExperimental initialMarkdownPath="/home/spectrum/playground/lyre/notes/Making a sound/0 Describing Sound.md" />
      </div>
    </div>
  );
}
