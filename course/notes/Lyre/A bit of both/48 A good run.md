# A good run
<!-- slide-id: 9de20e6f-ca65-4214-9d80-983b86e9f71d -->
<!-- tags: summary, synth -->

We've connected all the pieces. We can now write Lyre code as strings, tokenize it into lists, interpret those lists into sound generators, and stream the results to audio. The full pipeline works - from code to sound.

We've also implemented all the methods our synth provides. `tone` generates waves, `envelope` shapes them, and `sequence` plays them one after another. Everything is accessible through the language.

This has been good progress on the language engineering side. Let's pause here and return to sound engineering for a while. We need to explore how to combine several sound waves into a single sound - that's how we play harmonies. While we're at it, we might also add new primitives like `silence` and `repeat`, and explore other ways of composing waves.

We'll be enhancing our synth.

##### Back: [Sequence](47%20Sequence.md)

##### Next: [A deep breath](../Synth/49%20A%20deep%20breath.md)
