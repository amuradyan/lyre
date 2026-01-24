# dBFS
<!-- slide-id: e1536d65-d573-4ad7-b045-a02b13336902 -->
<!-- tags: synth, analysis, dB, decibel -->

It serves two purposes: to measure the ratio between a measurement and a reference, and to compress large ranges of values into smaller, more manageable ones.

dB is a unit to measure sound amplitude. it's logarithmic. dB = 20 log10(A/A0) where A0 is a reference amplitude. In digital audio we refer to the maximum amplitude representable and the dB /aka `dBFS` for _Full-Scale_/ values are negative just like in our chart on the left.

20 because the power is proportional to the square of the amplitude, 2 \* 10 /deci/ \* log.

Here are spme refrence values for deecibel - a hir dryer. ~140 we expoerience pain, this is a generalization and our ear is more sensitive to certain frequencies. A rock concert is around 120dB, a lawnmower 90dB, normal conversation 60dB, a quiet room 30dB, and the threshold of hearing is 0dB.

Note how the lawnmover is only 30 db quitere than a rock concert but in terms of power it's 1000 times less powerful. This is the effect of logarithmic scaling. The whole story of our ear is actually a whole different topic so we won't go deeper into it here. Instead let's see how this applies to our lyre sample.

Why do the sound start at -25db? because we have the mixing control.

##### Back: [A♯3](50%20A♯3.md)

##### Next: [Drafts](../drafts.md)
