# What next?
<!-- slide-id: 64f12883-6226-4b5c-a3af-ce10a7ebcdb9 -->
<!-- tags: pipeline, integration -->

We have three pieces now: a tokenizer that turns Lyre code into lists, an interpreter that evaluates those lists into sound generators, and a synth that turns generators into audio samples. Let's connect them.

The full chain looks like this:

    "(envelope (tone 261.63 500) 0.01 0.1 0.7 0.2)"
        ↓ tokenizer
    ["envelope", ["tone", "261.63", "500"], "0.01", "0.1", "0.7", "0.2"]
        ↓ interpreter
    sound generator
        ↓ yield from generator
    audio samples
        ↓ browser audio API
    sound

We can write Lyre expressions as strings, tokenize them into lists, interpret those lists into generators, and stream the results to the browser. We have an end-to-end pipeline from code to sound.

What's missing? Right now we hardcode everything - the envelope parameters, the synth functions. We can't define new sounds or compose existing ones. We need a way to name things and build abstractions. That's where we're headed next.

##### Back: [Matryoshka](44%20Matryoshka.md)

##### Next: [Playing Lyre](46%20Playing%20Lyre.md)
