# Filter envelopes
<!-- slide-id: d365141a-79c6-47cc-96e3-09b510cca858 -->
<!-- tags: filters, envelopes, timbre -->

The filter improved our sound - we can make it bright or dull by adjusting the cutoff. But there's still a problem: the cutoff is fixed throughout the sound. The timbre stays constant from start to finish.

Real plucked strings don't work this way. When you pluck a lyre string, it starts bright - the initial attack excites all the harmonics, high and low. As the string vibrates, the high frequencies decay faster than the low frequencies. Air resistance and internal damping in the string preferentially remove high-frequency energy. After a second or two, only the low harmonics remain - the sound has become dull and mellow.

Right now we can simulate this by choosing a low cutoff value, but then we lose the bright attack. We need the cutoff to start high and decay to low over time.

This is what a filter envelope does. Just like the amplitude envelope controls volume over time, the filter envelope controls brightness over time. For a plucked string, we want the filter cutoff to start at a high value /8000 Hz - very bright/ and decay to a low value /500 Hz - quite dull/. This simulates the natural decay of high harmonics in a real plucked string.

##### Back: [Building a filter](64%20Building%20a%20filter.md)

##### Next: [Dynamic cutoff](66%20Dynamic%20cutoff.md)
