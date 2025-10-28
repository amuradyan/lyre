const parseDestructuringStatement = (line) => {
  const match = line.match(/^\s*const\s+\{([^}]+)\}\s*=\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*;?\s*$/);
  if (!match) return null;

  const imports = match[1].split(',').map(s => s.trim());
  const moduleName = match[2];

  return { imports, moduleName };
};

const extractDestructuringStatements = (code) => {
  const lines = code.split('\n');
  const destructuringStatements = [];
  const codeLines = [];

  lines.forEach(line => {
    const parsed = parseDestructuringStatement(line);
    if (parsed) {
      destructuringStatements.push(parsed);
      codeLines.push(line);
    } else {
      codeLines.push(line);
    }
  });

  return { destructuringStatements, code: codeLines.join('\n') };
};

const extractTopLevelIdentifiers = (code) => {
  const identifiers = [];
  const functionRegex = /^\s*function\*?\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/gm;
  const constRegex = /^\s*const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm;
  const letRegex = /^\s*let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm;
  const varRegex = /^\s*var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm;

  let match;
  while ((match = functionRegex.exec(code)) !== null) {
    identifiers.push(match[1]);
  }
  while ((match = constRegex.exec(code)) !== null) {
    identifiers.push(match[1]);
  }
  while ((match = letRegex.exec(code)) !== null) {
    identifiers.push(match[1]);
  }
  while ((match = varRegex.exec(code)) !== null) {
    identifiers.push(match[1]);
  }

  return identifiers;
};

const wrapInModule = (code, identifiers) => {
  const exports = identifiers.map(id => `  ${id}`).join(',\n');
  return `(() => {
${code}

  return {
${exports}
  };
})()`;
};

export const bundleTabs = (tabs) => {
  const moduleMap = {};
  const moduleDeps = {};

  tabs.forEach(tab => {
    const moduleName = tab.filename || `module${tabs.indexOf(tab)}`;
    const { destructuringStatements, code } = extractDestructuringStatements(tab.code);

    moduleMap[moduleName] = { code, destructuringStatements };
    moduleDeps[moduleName] = destructuringStatements.map(d => d.moduleName);
  });

  const orderedModules = [];
  const processed = new Set();

  const processModule = (moduleName) => {
    if (processed.has(moduleName)) return;

    const deps = moduleDeps[moduleName] || [];
    deps.forEach(depName => {
      if (!processed.has(depName)) {
        processModule(depName);
      }
    });

    orderedModules.push(moduleName);
    processed.add(moduleName);
  };

  Object.keys(moduleMap).forEach(moduleName => {
    processModule(moduleName);
  });

  const bundledCode = orderedModules
    .map(moduleName => {
      const { code, destructuringStatements } = moduleMap[moduleName];
      const hasDestructuring = destructuringStatements.length > 0;

      if (!hasDestructuring) {
        const identifiers = extractTopLevelIdentifiers(code);
        const wrappedCode = wrapInModule(code, identifiers);
        return `const ${moduleName} = ${wrappedCode};`;
      } else {
        return code;
      }
    })
    .join('\n\n');

  return bundledCode;
};
