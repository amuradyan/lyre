function process(symbol, token, expressions, inComment) {
  const current = expressions[expressions.length - 1];

  if (inComment) {
    return [token, expressions];
  }

  switch (symbol) {
    case "(":
      if (token != "") {
        current.push(token);
      }
      expressions.push([]);
      return ["", expressions];
    case " ":
    case "|":
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
 * Expands syntactic sugar for sequence and harmony operators.
 * @param {Array} tokens - Array of tokens, possibly containing sugar syntax
 * @returns {Array} Tokens with sugar expanded
 * @example
 * desugar(["-", ["A2", "E3"]]) // returns [["sequence", "A2", "E3"]]
 * desugar(["=", ["C4", "E4", "G4"]]) // returns [["harmony", "C4", "E4", "G4"]]
 */
export function desugar(tokens) {
  const result = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "-" && Array.isArray(tokens[i + 1])) {
      result.push(["sequence", ...tokens[i + 1]]);
      i++; // skip next token, we consumed it
    } else if (tokens[i] === "=" && Array.isArray(tokens[i + 1])) {
      result.push(["harmony", ...tokens[i + 1]]);
      i++; // skip next token, we consumed it
    } else {
      result.push(tokens[i]);
    }
  }
  return result;
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
