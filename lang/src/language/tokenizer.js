function process(symbol, token, expressions, inComment) {
  const current = expressions[expressions.length - 1];

  if (inComment) {
    return [token, expressions];
  }

  switch (symbol) {
    case "(":
      expressions.push([]);
      return ["", expressions];
    case " ":
    case "\n":
    case "\t":
    case "\r":
      if (token != "") {
        current.push(token);
      }
      return ["", expressions];
    case ")":
      if (token != "") {
        current.push(token);
      }
      const completed = expressions.pop();
      const parent = expressions[expressions.length - 1];
      parent.push(completed);
      return ["", expressions];
    default:
      return [token + symbol, expressions];
  }
}

function checkForComments(symbol, inComment) {
  if (symbol === ";") {
    return true;
  } else if (symbol === "\n" || symbol === "\r") {
    return false;
  } else {
    return inComment;
  }
}

/**
 * Tokenizes Lyre code into nested arrays representing the expression tree.
 * @param {string} input - The Lyre code to parse
 * @returns {Array} Nested array where the first element is the operator and remaining elements are operands
 * @example
 * tokenize("(tone 440)") // returns ["tone", "440"]
 * tokenize("(envelope (tone 440) 0.05 0.1 0.9 0.1)") // returns nested array structure
 */
export function tokenize(input) {
  let token = "";
  let expressions = [[]];
  let inComment = false;

  for (const symbol of input) {
    inComment = checkForComments(symbol, inComment);
    [token, expressions] = process(symbol, token, expressions, inComment);
  }

  if (token != "") {
    const current = expressions[expressions.length - 1];
    current.push(token);
  }

  const result = expressions.pop();
  return result;
}
