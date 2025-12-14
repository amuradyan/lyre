export function* sequence(...generators) {
  for (const gen of generators) {
    yield* gen;
  }
}

export function* harmony(...generators) {
  while (true) {
    let sum = 0;
    let allDone = true;

    for (const gen of generators) {
      const { value, done } = gen.next();
      if (!done) {
        sum = sum + value;
        allDone = false;
      }
    }

    if (allDone) {
      return;
    }

    yield sum;
  }
}


export function* repeat(times, generatorFunc) {
  for (let i = 0; i < times; i++) {
    yield* generatorFunc();
  }
}
