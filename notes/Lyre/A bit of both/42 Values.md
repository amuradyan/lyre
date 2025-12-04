# Values
<!-- slide-id: 68d69580-a9bb-41fa-b980-e4fc43055f54 -->

Here are our evaluation rules:

    *Rule 1*: lists evaluate by applying the operator to the operands
    *Rule 2*: operators reference synth functions
    *Rule 3*: operands evaluate to themselves if they are numbers, otherwise they evaluate as lists

We have `(envelope (tone 261.63 500) 0.01 0.1 0.7 0.2)` tokenized as `["envelope", ["tone", "261.63", "500"], "0.01", "0.1", "0.7", "0.2"]`. Let's evaluate it step by step.

The expression is a list, so Rule 1 applies. The operator is `"envelope"`, the operands are `["tone", "261.63", "500"]`, `"0.01"`, `"0.1"`, `"0.7"`, `"0.2"`. Before applying the operator, we evaluate the operands.

First operand `["tone", "261.63", "500"]` is not a number, so Rule 3 says evaluate it as a list. Apply Rule 1: operator is `"tone"`, operands are `"261.63"` and `"500"`. Both operands are numbers, so they evaluate to themselves - `261.63` and `500`. Apply Rule 2: `"tone"` references `Synth.tone`. Apply the operator:

    ["tone", "261.63", "500"] → tone(261.63, 500) → sound generator

The remaining operands `"0.01"`, `"0.1"`, `"0.7"`, `"0.2"` are numbers, so they evaluate to `0.01`, `0.1`, `0.7`, `0.2`.

Now all operands are evaluated. Apply Rule 2: `"envelope"` references `Synth.envelope`. Apply the operator:

    ["envelope", sound generator, 0.01, 0.1, 0.7, 0.2] → envelope(sound generator, 0.01, 0.1, 0.7, 0.2) → enveloped sound

This enveloped sound is the _value_ of our expression - what it evaluates to.

##### Back: [Nested expressions](41%20Nested%20expressions.md)

##### Next: [Status quo](43%20Status%20quo.md)
