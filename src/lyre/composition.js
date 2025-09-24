export function* sequence(...generators) {
  for (const gen of generators) {
    yield* gen;
  }
}


export function* parallel(...generators) {
  const activeGens = [...generators];
  let activeCount = activeGens.length;
  
  while (activeCount > 0) {
    let sum = 0;
    let validSamples = 0;
    
    for (let i = 0; i < activeGens.length; i++) {
      if (activeGens[i]) {
        const next = activeGens[i].next();
        if (next.done) {
          activeGens[i] = null;
          activeCount--;
        } else {
          sum += next.value;
          validSamples++;
        }
      }
    }
    
    if (validSamples > 0) {
      yield sum / validSamples;
    }
  }
}


export function* repeat(times, generatorFunc) {
  for (let i = 0; i < times; i++) {
    yield* generatorFunc();
  }
}

