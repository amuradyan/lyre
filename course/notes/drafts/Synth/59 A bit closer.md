# A bit closer
<!-- slide-id: 53095e93-c2f1-4800-8d9f-dd26de5c403b -->
<!-- tags: synth, pluck, a#3 -->

After some experimenting and comparing to the original sample, I came to this:

```lyre
(gain
  (harmony
    (gain (envelope (tone 237) 0.01 2.0 0 0.1) 0.19)
    (gain (envelope (tone 473) 0.01 1.8 0 0.1) 0.06)
    (gain (envelope (tone 926) 0.01 1.6 0 0.1) 0.12)
    (gain (envelope (tone 947) 0.01 1.5 0 0.1) 0.08)
    (gain (envelope (tone 1873) 0.01 1.3 0 0.1) 0.15)
    (gain (envelope (tone 2347) 0.01 1.0 0 0.1) 0.04)
    (gain (envelope (tone 3747) 0.01 0.8 0 0.1) 0.03)
    (gain (envelope (tone 4220) 0.01 0.7 0 0.1) 0.10)
    (gain (envelope (tone 5663) 0.01 0.5 0 0.1) 0.04)
    (gain (envelope (tone 6158) 0.01 0.4 0 0.1) 0.04)
    (gain (envelope (tone 8635) 0.01 0.3 0 0.1) 0.05)
    (gain (envelope (tone 9647) 0.01 0.25 0 0.1) 0.11))
  1.5)
```

12 pitches captured - each with its own envelope with different decay times /higher frequencies fade faster, mimicking how a plucked string behaves/. The parameters are purely by ear: the _attack_ is set to `0.01` for a quick onset, _decay_ times range from `2.0` seconds for the lowest harmonic down to `0.25` seconds for the highest, _sustain_ is `0` so they all fade to silence, and _release_ is a brief `0.1` seconds to give a little tail.

The _gain_ levels are adjusted according to the original sample's relative harmonic amplitudes. The outer gain at 1.5 boosts the overall level to match the original recording's amplitude.

This is good enough for now. The sound is recognizable and captures the essential character of the pluck.

##### Back: [Gain](58%20Gain.md)

##### Next: [Drafts](../drafts.md)
