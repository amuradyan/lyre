import { evaluateCode, parseTestComment, runMarkdownTest, executeMarkdownTest } from './testRunner.js';

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`);
  }
}

function assertEquals(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}. ${message}`);
  }
}

function assertTrue(condition, message = '') {
  if (!condition) {
    throw new Error(`Expected true. ${message}`);
  }
}

test('evaluateCode - simple expression', () => {
  const result = evaluateCode('2 + 2');
  assertTrue(result.success, 'Should succeed');
  assertEquals(result.result, 4, 'Should return 4');
});

test('evaluateCode - string value', () => {
  const result = evaluateCode('"hello world"');
  assertTrue(result.success, 'Should succeed');
  assertEquals(result.result, "hello world", 'Should return string');
});

test('evaluateCode - function declaration', () => {
  const result = evaluateCode(`
function double(x) {
  return x * 2;
}
  `);
  assertTrue(result.success, 'Should succeed');
  assertEquals(typeof result.result, 'function', 'Should return function');
  assertEquals(result.result(5), 10, 'Function should work correctly');
});

test('evaluateCode - arrow function', () => {
  const result = evaluateCode('x => x * 3');
  assertTrue(result.success, 'Should succeed');
  assertEquals(typeof result.result, 'function', 'Should return function');
  assertEquals(result.result(4), 12, 'Arrow function should work');
});

test('evaluateCode - syntax error', () => {
  const result = evaluateCode('function broken( {');
  assertTrue(!result.success, 'Should fail on syntax error');
  console.log('Actual error message:', result.error);
  assertTrue(result.error && result.error.length > 0, 'Should have error message');
});

test('parseTestComment - string value', () => {
  const result = parseTestComment('<!-- "hello" -->');
  assertEquals(result.testSpec, "hello", 'Should parse string');
  assertEquals(result.layout, 'grid', 'Should have default layout');
});

test('parseTestComment - number value', () => {
  const result = parseTestComment('<!-- 42 -->');
  assertEquals(result.testSpec, 42, 'Should parse number');
  assertEquals(result.layout, 'grid', 'Should have default layout');
});

test('parseTestComment - object value', () => {
  const result = parseTestComment('<!-- {"2": "a", "3": "b"} -->');
  assertEquals(result.testSpec, { "2": "a", "3": "b" }, 'Should parse object');
  assertEquals(result.layout, 'grid', 'Should have default layout');
});

test('parseTestComment - invalid comment', () => {
  const originalWarn = console.warn;
  console.warn = () => { };

  const result = parseTestComment('<!-- invalid json -->');
  assertEquals(result, null, 'Should return null for invalid JSON');

  console.warn = originalWarn;
});

test('parseTestComment - empty comment', () => {
  const result = parseTestComment('');
  assertEquals(result, null, 'Should return null for empty comment');
});

test('runMarkdownTest - value comparison success', () => {
  const evalResult = { success: true, result: "hello", error: null };
  const testSpec = "hello";
  const result = runMarkdownTest(evalResult, testSpec);

  assertTrue(result.success, 'Test should pass');
  assertEquals(result.type, 'value', 'Should be value type');
  assertEquals(result.results[0].passed, true, 'Result should pass');
});

test('runMarkdownTest - value comparison failure', () => {
  const evalResult = { success: true, result: "hello", error: null };
  const testSpec = "goodbye";
  const result = runMarkdownTest(evalResult, testSpec);

  assertTrue(!result.success, 'Test should fail');
  assertEquals(result.type, 'value', 'Should be value type');
  assertEquals(result.results[0].passed, false, 'Result should fail');
});

test('runMarkdownTest - function test success', () => {
  const double = x => x * 2;
  const evalResult = { success: true, result: double, error: null };
  const testSpec = [
    { inputs: [2], expected: 4 },
    { inputs: [3], expected: 6 }
  ];
  const result = runMarkdownTest(evalResult, testSpec);

  assertTrue(result.success, 'Test should pass');
  assertEquals(result.type, 'function', 'Should be function type');
  assertEquals(result.results.length, 2, 'Should have 2 test results');
  assertTrue(result.results.every(r => r.passed), 'All tests should pass');
});

test('runMarkdownTest - function test failure', () => {
  const double = x => x * 2;
  const evalResult = { success: true, result: double, error: null };
  const testSpec = [
    { inputs: [2], expected: 5 },
    { inputs: [3], expected: 6 }
  ];
  const result = runMarkdownTest(evalResult, testSpec);

  assertTrue(!result.success, 'Test should fail');
  assertEquals(result.type, 'function', 'Should be function type');
  assertEquals(result.results[0].passed, false, 'First test should fail');
  assertEquals(result.results[1].passed, true, 'Second test should pass');
});

test('runMarkdownTest - evaluation error', () => {
  const evalResult = { success: false, result: null, error: "Syntax error" };
  const testSpec = "anything";
  const result = runMarkdownTest(evalResult, testSpec);

  assertTrue(!result.success, 'Should fail');
  assertEquals(result.results.length, 1, 'Should have one result');
  assertEquals(result.results[0].passed, false, 'Result should fail');
});

test('runMarkdownTest - function runtime crash', () => {
  const crashingFunction = x => {
    if (x === 5) {
      throw new Error('Custom crash reason');
    }
    if (x === 10) {
      return undefined.someProperty;
    }
    return x * 2;
  };

  const evalResult = { success: true, result: crashingFunction, error: null };
  const testSpec = [
    { inputs: [3], expected: 6 },
    { inputs: [5], expected: 10 },
    { inputs: [10], expected: 20 }
  ];
  const result = runMarkdownTest(evalResult, testSpec);

  assertTrue(!result.success, 'Test should fail due to crashes');
  assertEquals(result.type, 'function', 'Should be function type');
  assertEquals(result.results.length, 3, 'Should have 3 test results');

  assertEquals(result.results[0].passed, true, 'First test should pass');
  assertEquals(result.results[0].actual, 6, 'First test result should be 6');

  assertEquals(result.results[1].passed, false, 'Second test should fail');
  assertEquals(result.results[1].actual, null, 'Second test actual should be null on crash');
  assertEquals(result.results[1].error, 'Custom crash reason', 'Should capture custom error message');

  assertEquals(result.results[2].passed, false, 'Third test should fail');
  assertEquals(result.results[2].actual, null, 'Third test actual should be null on crash');
  assertTrue(result.results[2].error.includes('Cannot read'), 'Should capture TypeError message');
});

test('executeMarkdownTest - complete pipeline value', () => {
  const code = '"test string"';
  const comment = '<!-- "test string" -->';
  const result = executeMarkdownTest(code, comment);

  assertTrue(result.success, 'Integration test should pass');
  assertEquals(result.type, 'value', 'Should be value type');
});

test('executeMarkdownTest - complete pipeline function', () => {
  const code = 'function add(x) { return x + 1; }';
  const comment = '<!--[{"inputs": [5], "expected": 6}, {"inputs": [10], "expected": 11}]-->';
  const result = executeMarkdownTest(code, comment);

  assertTrue(result.success, 'Integration test should pass');
  assertEquals(result.type, 'function', 'Should be function type');
  assertEquals(result.results.length, 2, 'Should have 2 test results');
});

test('runMarkdownTest - generator function success', () => {
  function* countTo(n) {
    for (let i = 1; i <= n; i++) {
      yield i;
    }
  }
  const evalResult = { success: true, result: countTo, error: null };
  const testSpec = [
    { inputs: [3], expected: [1, 2, 3] },
    { inputs: [1], expected: [1] },
    { inputs: [5], expected: [1, 2, 3, 4, 5] }
  ];
  const result = runMarkdownTest(evalResult, testSpec);

  assertTrue(result.success, 'Generator test should pass');
  assertEquals(result.type, 'generator', 'Should be generator type');
  assertEquals(result.results.length, 3, 'Should have 3 test results');
  assertTrue(result.results.every(r => r.passed), 'All generator tests should pass');
});

test('runMarkdownTest - generator function failure', () => {
  function* countTo(n) {
    for (let i = 1; i <= n; i++) {
      yield i;
    }
  }
  const evalResult = { success: true, result: countTo, error: null };
  const testSpec = [
    { inputs: [3], expected: [1, 2, 3] },
    { inputs: [2], expected: [1, 2, 3] }
  ];
  const result = runMarkdownTest(evalResult, testSpec);

  assertTrue(!result.success, 'Generator test should fail');
  assertEquals(result.type, 'generator', 'Should be generator type');
  assertEquals(result.results[0].passed, true, 'First test should pass');
  assertEquals(result.results[1].passed, false, 'Second test should fail');
  assertEquals(result.results[1].actual, [1, 2], 'Should show actual generator output');
});

test('runMarkdownTest - generator with empty output', () => {
  function* emptyGenerator() {
    return;
  }
  const evalResult = { success: true, result: emptyGenerator, error: null };
  const testSpec = [
    { inputs: [], expected: [] }
  ];
  const result = runMarkdownTest(evalResult, testSpec);

  assertTrue(result.success, 'Empty generator test should pass');
  assertEquals(result.results[0].passed, true, 'Empty generator should match empty array');
});

test('executeMarkdownTest - complete pipeline generator', () => {
  const code = `function* range(start, end) {
    for (let i = start; i <= end; i++) {
      yield i;
    }
  }`;
  const comment = '<!--[{"inputs": [1, 3], "expected": [1, 2, 3]}, {"inputs": [5, 7], "expected": [5, 6, 7]}]-->';
  const result = executeMarkdownTest(code, comment);

  assertTrue(result.success, 'Generator integration test should pass');
  assertEquals(result.type, 'generator', 'Should be generator type');
  assertEquals(result.results.length, 2, 'Should have 2 test results');
  assertTrue(result.results.every(r => r.passed), 'All results should pass');
});

console.log('Running MarkdownTestRunner tests...\n');
