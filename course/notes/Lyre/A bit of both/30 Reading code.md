# Reading code
<!-- slide-id: 3aaf6af9-1be8-41a4-a5ba-9eb646f476d8 -->
<!-- tags: parsing, lisp, expressions -->

I once read that programs are written mostly to be read by humans and only occasionally executed by machines. Whether that's true or not /it is/, machines still need to read code. But how does a machine read text? How does it make sense of the code?

Turns out machines read character by character, just like us sometimes. They pay attention to whitespaces - spaces and newlines - to figure out where words begin and end. Special characters like parentheses mark boundaries too. Different programming languages have different rules for this, and languages with similar rules get grouped into families.

Lyre is from the Lisp family - it looks strange at first but uniform. Just words, `(` and `)`, nested and in sequence. _DoReMi_ in Lyre looks like this:

```lisp
(sequence
  (tone C4 500)
  (tone D4 500)
  (tone E4 500))
```

Notice that `(tone C4 500)` is itself an expression inside the `sequence` expression. An expression can be either a single word /like `C4` or `500`/ or a list wrapped in parens /first word is the operation, rest can be words or other expressions/.

We're not worrying about ADSR yet - that comes later. First, let's figure out how to parse this.

##### Back: [Wrapping it up](../Musings%20in%20sound%20synthesis/29%20Wrapping%20it%20up.md)

##### Next: [Tokens](31%20Tokens.md)
