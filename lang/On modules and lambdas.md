# On modules and lambdas

We'll start with lambdas and end on modules, or modularity at least.

Lyre provides both `lowpass` and `highpass` filters. This means we can do a proper `bandpass` if we can express the combination of the two. Lyre has no way of doing such things generally, since it lacks an important abstraction - lambdas, i.e. anonymous functions. We should get them then.

Since we want our language to express things from sound synthesis, I have decided to call the lambda form `patch` - a word that has modular synth lineage. A _patch_ in modular synthesis is the wiring of modules into a signal-flow graph: a routing of cables between oscillators, filters, envelopes /Eurorack folks share patches the way programmers share programs/.

The syntax and behavior would be the same as a lambda otherwise:

```text
(patch (arg1 arg2 ...)
  body)
```

So far so good, now to the modules...

What I want a module to do is:

- carry a unit of work
- carry its own dictionary
- share both and use others'

It would be a plus if we can refer to it by name. And then it got me thinking - a patch, i.e. a lambda, can already carry a unit of work and its own dictionary, it's just that dictionary is not accessible. If we think of a mechanism to use that dictionary, we might just have ourselves a module. Better, we get the treat of modularity without introducing a new construct.

For namespace access, we'll go with the good old `define` - a single block per patch, right above the patch body. `export`-s will go on 'top', right after the arguments, then we'll declare our other patch `use`-s. Like so:

```text
(patch a-and-b (ga go)
  (export a b)
  (use neighbor for c d)
  (use do-stuff-with) ; sugar for `(use do-stuff-with for do-stuff-with)`

  (define
    a (do-stuff-with c)
    b (do-stuff-with d))

  (do-stuff-with a b ga go))
```

Hence, modules and lambdas are the same thing - a _patch_.

Imagine we want to do a _wah-wah_ on shakuhachi [chi](https://josenshakuhachi.com/shakuhachi-guides/shakuhachi-note-charts) to get a gig at a local ramen place. We have a patch that does wah-wah, and a patch that contains woodwind, shakuhachi among them. Here's what it might look like...

```text
; ww.lyre - the woodwinds module
(patch ww
  (export shakuhachi flute)

  ; **Note:** the `shakuhachi` and `flute` bodies are placeholders for show only
  ; sine-with-envelope sketches, not actual woodwind synthesis.
  ; ONLY for module illustration, not to make believable sound.

  (define
    shakuhachi (patch (freq) (envelope 0.1 0.2 0.6 0.3 (sine freq)))
    flute      (patch (freq) (envelope 0.05 0.1 0.7 0.2 (sine freq)))))
```

The patch above defines and exports two woodwind instruments, `shakuhachi` and `flute`. Note how the bodies are patches as well. Then we have the wah-wah patch:

```text
; wah-wah.lyre - bandpass with a center that sweeps between top and bottom at rate Hz
(patch wah-wah (top bottom rate source)
  (let
    (center (/ (+ top bottom) 2)
     swing  (/ (- top bottom) 2))

    (bandpass
      (+ center (* (sine rate) swing))
      source)))
```

This here will be an actual implementation of a wah-wah - once a bandpass filter is introduced to Lyre, which, in itself, will be a combination of a lowpass and a highpass as a patch.

Finally, we have the wah-wah shakuhachi patch that uses both of the above:

```text
; shakuhachi-wah-wah.lyre
(patch shakuhachi-wah-wah
  ; sugar for `(use wah-wah for wah-wah)`
  (use wah-wah)           ; bring in the wah-wah patch
  (use ww for shakuhachi) ; from woodwinds get the shakuhachi

  (let
    (top 1000
     bottom 500
     rate 1.5
     chi 440)

    (wah-wah top bottom rate (shakuhachi chi))))
```

Looks legit. All this opens the door to circular dependencies - for starters we just forbid them.

Another thing to note is that the `export` cannot contain patch arguments - not sure how that would work out, we'll see.
