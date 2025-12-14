# What we have
<!-- slide-id: f1721624-224c-4b9b-be62-22f3461aa2fc -->
<!-- tags: harmony, primitives, synth -->

We've built a working pipeline from Lyre code to sound. The synth has three primitives: `tone` generates sine waves, `envelope` applies ADSR shaping, and `sequence` plays generators one after another. This gives us melody.

But try to write a chord - C, E, and G sounding together. There's no way to do it. We can only play notes in sequence, never in parallel. What about repetition or silence? No primitives for those either.

While harmonies, repetition, and silence are all fundamental to music, only the first is fundamental to the engine. The last two can be expressed with what we have and are mere conveniences we'll want eventually.

Overlaying tones also bring Lyre closer to sounding like a lyre. The thing is when you pluck a string on a lyre, you don't just hear the fundamental frequency. The string vibrates in multiple modes at once - the full length, half length, third length, and so on.

I propose we do another round of sound synthesis to build a richer synth - one that gives the language more expressive power to make different music.

On to combining sounds then!

##### Back: [A good run](../A%20bit%20of%20both/48%20A%20good%20run.md)

##### Next: [Waves](50%20Waves.md)
