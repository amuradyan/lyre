# Reading code
<!-- slide-id: 3aaf6af9-1be8-41a4-a5ba-9eb646f476d8 -->

I've read in a programming book once that computer programs are written to be mostly read by humans and only occasionally executed by machines. Regardless of whether that's true or not /it is true/, the occasional executions by the machine also assume reading the code. But how does a machine read text? How does it make sense of the sentences in the code?

Turns out, that just like us, machines read the text character by character, paying attention to *whitespaces* like spaces and new lines to make up words. Then there are other special characters that denote the end of the sentence, and even its' beginning. Akin to human languages, programming languages also come with their own semantic and syntactic rules that can differ drastically, and similarly they can be grouped in families.

Lyre will be of Lisp family, i.e. it will use parentheses `(` and `)` to mark both the beginning and the end of every expression and each expressions first word is the operation we want to perform and the rest are the operands. The `DoReMi` in Lyre would look like this:

```lisp
(sequence
  (tone C4 500)
  (tone D4 500)
  (tone E4 500))
```

This does not mention the *ADSR*, but we'll get to that later. First, we deal with parsing.

## Back

[Wrapping it up](../Musings%20in%20sound%20synthesis/29%20Wrapping%20it%20up.md)

## Next

[Tokens](31%20Tokens.md)
