So, I want
to be able to define syntax elements
all at once.
but
how do I make sure that inference still works?

- defining grammars as a smattering, seems fine. I'll have my concat build job put them all into one file, and I'll be able to diagnose lint errors there
- defining ToTast and ToAst and ToPP. I guess it's just a matter of ... spreading them all into the same thing? ... seems fine. Inference should still work?

Yeah let's try that. Grammars last.

OH my transform generator will have to learn to follow imports.

OK so true story I'd also love to be able to split out the "analyze" stuff into those files as well.

hmmm. but the `transform` dealio doesn't go into union types.
It just calls `Expression` (or `ExpressionPost`) instead of calling `Apply`. Although if something does directly reference `Apply` it will call that.
So, what if it made some stuff like `Expression_Apply`? And it would expect a `t.Apply` *but* importantly it would be allowed to return a `t.Expression`.
I do like that.
And then, we could export `const analyze: Visitor<Ctx>`, and spread them all into the visitor, and it would be great! yes I like it.